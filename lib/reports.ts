import prisma from './prisma';
import { Attendance, Employee } from '@prisma/client';
import { startOfDay, endOfDay, format, subDays, startOfMonth } from 'date-fns';

type AttendanceWithEmployee = Attendance & { employee: Employee };

export async function getDashboardStats() {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(today);
    const sevenDaysAgo = subDays(startOfDay(new Date()), 6);

    // Fetch all data in parallel to reduce wait time
    const [totalEmployees, attendancesToday, allEmployees, weekAttendances] = await Promise.all([
        prisma.employee.count(),
        prisma.attendance.findMany({
            where: {
                clockInTime: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                employee: true,
            },
            orderBy: {
                clockInTime: 'desc'
            }
        }),
        prisma.employee.findMany(),
        // Fetch all attendances for the last 7 days in one query
        prisma.attendance.findMany({
            where: {
                clockInTime: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                employeeId: true,
                clockInTime: true,
            }
        })
    ]);

    const uniqueEmployeeIds = new Set(attendancesToday.map((a) => a.employeeId));
    const presentCount = uniqueEmployeeIds.size;
    const absentCount = totalEmployees - presentCount;

    const dailyDetails = allEmployees.map((emp) => {
        const empAttendances = attendancesToday.filter((a) => a.employeeId === emp.id);

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

        const sortedAtt = [...empAttendances].sort((a, b) => a.clockInTime.getTime() - b.clockInTime.getTime());
        const firstClockIn = sortedAtt[0].clockInTime;
        const lastClockOut = sortedAtt[sortedAtt.length - 1].clockOutTime;
        const isCurrentlyClockedIn = empAttendances.some((a) => !a.clockOutTime);
        const status = isCurrentlyClockedIn ? 'CLOCKED_IN' : 'COMPLETED';
        const totalHours = empAttendances.reduce((sum: number, a) => sum + (a.totalHours || 0), 0);

        const locations = new Set<string>();
        empAttendances.forEach((a) => {
            if (a.clockInLocation) locations.add(a.clockInLocation);
            if (a.clockOutLocation) locations.add(a.clockOutLocation);
        });

        return {
            id: emp.id,
            name: emp.name,
            employeeId: emp.employeeId,
            status,
            clockIn: firstClockIn,
            clockOut: isCurrentlyClockedIn ? null : lastClockOut,
            totalHours,
            locations: Array.from(locations),
        };
    });

    // Build chart data from the single query result
    const chartData: { date: string; present: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(startOfDay(new Date()), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const nextDate = endOfDay(date);

        // Filter in-memory instead of querying database
        const dailyAtt = weekAttendances.filter((a) => {
            const clockInDate = new Date(a.clockInTime);
            return clockInDate >= date && clockInDate < nextDate;
        });
        const unique = new Set(dailyAtt.map((a) => a.employeeId));

        chartData.push({
            date: dateStr,
            present: unique.size,
        });
    }

    // Include additional data for the dashboard
    const weeklyTrend = await getWeeklyHistory();

    return {
        totalEmployees,
        present: presentCount,
        absent: Math.max(0, absentCount),
        activeClockIns: attendancesToday.filter((a: any) => !a.clockOutTime).length,
        chartData,
        weeklyTrend: JSON.parse(JSON.stringify(weeklyTrend)),
        recentActivity: JSON.parse(JSON.stringify(attendancesToday.slice(0, 5))),
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

    attendances.forEach((att) => {
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

    const payroll = employees.map((emp) => {
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
    const startOfCurMonth = startOfMonth(now);

    const monthlyAttendances = employee.attendances.filter((a) => a.clockInTime >= startOfCurMonth);
    const totalMonthlyHours = monthlyAttendances.reduce((acc: number, a) => acc + (a.totalHours || 0), 0);
    const completedShifts = monthlyAttendances.filter((a) => a.clockOutTime).length;
    const avgHoursPerShift = completedShifts > 0 ? totalMonthlyHours / completedShifts : 0;

    // 30-day trend
    const chartData: { date: string; hours: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(startOfDay(now), i);
        const dateStr = format(date, 'yyyy-MM-dd');

        const dayAttendance = employee.attendances.find((a) =>
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
            totalMonthlyHours: parseFloat(totalMonthlyHours.toFixed(2)),
            avgHoursPerShift: parseFloat(avgHoursPerShift.toFixed(2)),
            totalShifts: completedShifts,
            status: employee.attendances[0] && !employee.attendances[0].clockOutTime ? 'CLOCKED_IN' : 'CLOCKED_OUT',
        },
        history: JSON.parse(JSON.stringify(employee.attendances.slice(0, 30))),
        chartData,
    };
}

export async function deleteAttendance(id: string) {
    return prisma.attendance.delete({ where: { id } });
}


