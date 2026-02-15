import prisma from './prisma';
import { Attendance, Employee } from '@prisma/client';
import { startOfDay, endOfDay, format, subDays } from 'date-fns';

type AttendanceWithEmployee = Attendance & { employee: Employee };

export async function getDashboardStats(targetDate = new Date()) {
    const selectedDate = startOfDay(new Date(targetDate));
    const nextDay = endOfDay(selectedDate);
    // Date boundaries for queries

    const [totalEmployees, attendancesForDate, allEmployees, weekAttendances, allAttendances] = await Promise.all([
        prisma.employee.count(),
        // Get attendance for the selected date
        prisma.attendance.findMany({
            where: {
                clockInTime: {
                    gte: selectedDate,
                    lte: nextDay,
                },
            },
            include: {
                employee: true,
            }
        }),
        prisma.employee.findMany(),
        // Fetch all attendances for the last 14 days for charts
        prisma.attendance.findMany({
            where: {
                clockInTime: {
                    gte: subDays(startOfDay(new Date()), 13),
                },
            },
            select: {
                employeeId: true,
                clockInTime: true,
            }
        }),
        // Recent activity (still globally recent)
        prisma.attendance.findMany({
            take: 50,
            orderBy: {
                clockInTime: 'desc'
            },
            include: {
                employee: true,
            }
        })
    ]);

    const uniqueEmployeeIds = new Set(attendancesForDate.map((a: AttendanceWithEmployee) => a.employeeId));
    const presentCount = uniqueEmployeeIds.size;
    const absentCount = totalEmployees - presentCount;

    const dailyDetails = allEmployees.map((emp: Employee) => {
        const empAttendances = attendancesForDate.filter((a: AttendanceWithEmployee) => a.employeeId === emp.id);

        if (empAttendances.length === 0) {
            return {
                id: emp.id,
                name: emp.name,
                employeeId: emp.employeeId,
                status: 'ABSENT',
                clockIn: null,
                clockOut: null,
                totalHours: 0,
                locations: [],
            };
        }

        const sortedAtt = [...empAttendances].sort((a: AttendanceWithEmployee, b: AttendanceWithEmployee) => a.clockInTime.getTime() - b.clockInTime.getTime());
        const firstClockIn = sortedAtt[0].clockInTime;
        const lastClockOut = sortedAtt[sortedAtt.length - 1].clockOutTime;
        const isCurrentlyClockedIn = empAttendances.some((a: AttendanceWithEmployee) => !a.clockOutTime);
        const status = isCurrentlyClockedIn ? 'CLOCKED_IN' : 'COMPLETED';
        const totalHours = empAttendances.reduce((sum: number, a: AttendanceWithEmployee) => sum + (a.totalHours || 0), 0);

        const locations = new Set<string>();
        empAttendances.forEach((a: AttendanceWithEmployee) => {
            if (a.clockInLocation) locations.add(a.clockInLocation);
            if (a.clockOutLocation) locations.add(a.clockOutLocation);
        });

        return {
            id: emp.id,
            name: emp.name,
            employeeId: emp.employeeId,
            status,
            clockIn: firstClockIn,
            clockInLocation: sortedAtt[0].clockInLocation,
            clockOut: isCurrentlyClockedIn ? null : lastClockOut,
            clockOutLocation: isCurrentlyClockedIn ? null : sortedAtt[sortedAtt.length - 1].clockOutLocation,
            totalHours,
            locations: Array.from(locations),
        };
    });

    // Build chart data for the last 14 days (Biweekly)
    const chartData: { date: string; present: number }[] = [];
    for (let i = 13; i >= 0; i--) {
        const date = subDays(startOfDay(new Date()), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const nextDate = endOfDay(date);

        // Filter in-memory instead of querying database
        const dailyAtt = weekAttendances.filter((a: { employeeId: string; clockInTime: Date }) => {
            const clockInDate = new Date(a.clockInTime);
            return clockInDate >= date && clockInDate < nextDate;
        });
        const unique = new Set(dailyAtt.map((a: any) => a.employeeId));

        chartData.push({
            date: dateStr,
            present: unique.size,
        });
    }


    return {
        totalEmployees,
        present: presentCount,
        absent: Math.max(0, absentCount),
        activeClockIns: attendancesForDate.filter((a: AttendanceWithEmployee) => !a.clockOutTime).length,
        chartData,
        recentActivity: JSON.parse(JSON.stringify(allAttendances.slice(0, 5))),
        dailyDetails: JSON.parse(JSON.stringify(dailyDetails)),
    };
}

export async function getWeeklyHistory() {
    const oneYearAgo = subDays(new Date(), 365);
    const attendances = await prisma.attendance.findMany({
        where: {
            clockInTime: { gte: oneYearAgo }
        },
        select: {
            clockInTime: true,
            totalHours: true,
        }
    });

    const weeklyData: Record<string, { week: string, hours: number, count: number }> = {};

    attendances.forEach((att: { clockInTime: Date; totalHours: number | null }) => {
        // Simple week grouping
        const date = new Date(att.clockInTime);
        const day = date.getDay();
        const diff = date.getDate() - day;
        const startOfWeekDate = new Date(date.setDate(diff));
        const weekStart = format(startOfWeekDate, 'yyyy-MM-dd');

        if (!weeklyData[weekStart]) {
            weeklyData[weekStart] = { week: weekStart, hours: 0, count: 0 };
        }
        weeklyData[weekStart].hours += att.totalHours || 0;
        weeklyData[weekStart].count += 1;
    });

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
}

export async function getBiWeeklyPayroll() {
    const employees = await prisma.employee.findMany({
        include: {
            attendances: {
                where: {
                    clockInTime: {
                        gte: subDays(new Date(), 14)
                    }
                }
            }
        }
    });

    const payroll = employees
        .filter(emp => emp.attendances.length > 0) // Only show employees with attendance in this period
        .map((emp: Employee & { attendances: Attendance[] }) => {
            const hours = emp.attendances.reduce((sum: number, a: Attendance) => sum + (a.totalHours || 0), 0);
            return {
                id: emp.id,
                name: emp.name,
                employeeId: emp.employeeId,
                hours: parseFloat(hours.toFixed(2)),
                rate: emp.hourlyRate,
                amount: parseFloat((hours * emp.hourlyRate).toFixed(2))
            };
        });

    // Mocking the "Period" structure from legacy for UI compatibility
    return [{
        period: `${format(subDays(new Date(), 14), 'MMM dd')} - ${format(new Date(), 'MMM dd, yyyy')}`,
        employees: payroll
    }];
}

export async function getEmployeeStats(id: string) {
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            attendances: {
                orderBy: { clockInTime: 'desc' },
            },
        },
    });

    if (!employee) {
        return null;
    }

    const now = new Date();
    // Biweekly Stats: Last 14 days
    const fourteenDaysAgo = subDays(startOfDay(now), 14);
    const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const biweeklyAttendances = employee.attendances.filter((a: Attendance) => a.clockInTime >= fourteenDaysAgo);
    const monthlyAttendances = employee.attendances.filter((a: Attendance) => a.clockInTime >= startOfMonthDate);

    const totalBiweeklyHours = biweeklyAttendances.reduce((acc: number, a: Attendance) => acc + (a.totalHours || 0), 0);
    const totalMonthlyHours = monthlyAttendances.reduce((acc: number, a: Attendance) => acc + (a.totalHours || 0), 0);

    const completedShifts = biweeklyAttendances.filter((a: Attendance) => a.clockOutTime).length;
    const avgHoursPerShift = completedShifts > 0 ? totalBiweeklyHours / completedShifts : 0;

    // 30-day trend
    const chartData: { date: string; hours: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(startOfDay(now), i);
        const dateStr = format(date, 'yyyy-MM-dd');

        const dayAttendance = employee.attendances.find((a: Attendance) =>
            format(a.clockInTime, 'yyyy-MM-dd') === dateStr
        );

        chartData.push({
            date: dateStr,
            hours: dayAttendance?.totalHours || 0,
        });
    }

    return {
        employee: {
            ...employee,
            attendances: undefined
        },
        stats: {
            totalBiweeklyHours: parseFloat(totalBiweeklyHours.toFixed(2)),
            totalMonthlyHours: parseFloat(totalMonthlyHours.toFixed(2)),
            avgHoursPerShift: parseFloat(avgHoursPerShift.toFixed(2)),
            totalShifts: completedShifts,
            status: employee.attendances[0] && !employee.attendances[0].clockOutTime ? 'CLOCKED_IN' : 'CLOCKED_OUT',
        },
        history: JSON.parse(JSON.stringify(employee.attendances.slice(0, 90))),
        chartData,
    };
}

export async function deleteAttendance(id: string) {
    return prisma.attendance.delete({ where: { id } });
}


// ============================================
// HR Attendance Edit & Audit Functions
// ============================================

interface EditAttendanceParams {
    attendanceId: string;
    clockInTime?: Date;
    clockOutTime?: Date;
    clockInLocation?: string;
    clockOutLocation?: string;
    reason: string;
    hrEmail: string;
}

interface CreateManualAttendanceParams {
    employeeId: string;
    clockInTime: Date;
    clockOutTime?: Date;
    clockInLocation?: string;
    clockOutLocation?: string;
    reason: string;
    hrEmail: string;
}

// Edit existing attendance record
export async function editAttendanceRecord(params: EditAttendanceParams) {
    const { attendanceId, clockInTime, clockOutTime, clockInLocation, clockOutLocation, reason, hrEmail } = params;

    // Get existing attendance record
    const existing = await prisma.attendance.findUnique({
        where: { id: attendanceId }
    });

    if (!existing) {
        throw new Error('Attendance record not found');
    }

    // Prepare update data
    const updateData: any = {
        isManuallyEdited: true,
        editedBy: hrEmail,
        editedAt: new Date(),
        editReason: reason,
    };

    if (clockInTime) updateData.clockInTime = clockInTime;
    if (clockOutTime !== undefined) updateData.clockOutTime = clockOutTime;
    if (clockInLocation !== undefined) updateData.clockInLocation = clockInLocation;
    if (clockOutLocation !== undefined) updateData.clockOutLocation = clockOutLocation;

    // Calculate new total hours if times changed
    const finalClockInTime = updateData.clockInTime || existing.clockInTime;
    const finalClockOutTime = updateData.clockOutTime !== undefined ? updateData.clockOutTime : existing.clockOutTime;

    if (finalClockOutTime) {
        const durationMs = finalClockOutTime.getTime() - finalClockInTime.getTime();
        updateData.totalHours = durationMs / (1000 * 60 * 60);

        if (updateData.totalHours < 0) {
            throw new Error('Clock out time must be after clock in time');
        }
    }

    // Update the record
    return prisma.attendance.update({
        where: { id: attendanceId },
        data: updateData,
        include: {
            employee: true
        }
    });
}

// Create manual attendance record
export async function createManualAttendance(params: CreateManualAttendanceParams) {
    const { employeeId, clockInTime, clockOutTime, clockInLocation, clockOutLocation, reason, hrEmail } = params;

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Calculate total hours if clock out time provided
    let totalHours: number | null = null;
    if (clockOutTime) {
        const durationMs = clockOutTime.getTime() - clockInTime.getTime();
        totalHours = durationMs / (1000 * 60 * 60);

        if (totalHours < 0) {
            throw new Error('Clock out time must be after clock in time');
        }
    }

    // Create attendance record
    return prisma.attendance.create({
        data: {
            employeeId,
            clockInTime,
            clockOutTime,
            clockInLocation,
            clockOutLocation,
            totalHours,
            status: clockOutTime ? 'COMPLETED' : 'CLOCKED_IN',
            isManuallyEdited: true,
            editedBy: hrEmail,
            editedAt: new Date(),
            editReason: reason,
        },
        include: {
            employee: true,
        }
    });
}

export async function getAttendanceAuditHistory(attendanceId: string) {
    // This is a simplified version since we primarily use the fields on the Attendance model now
    return prisma.attendance.findUnique({
        where: { id: attendanceId },
        select: {
            isManuallyEdited: true,
            editedBy: true,
            editedAt: true,
            editReason: true,
        }
    });
}
