import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfWeek, endOfWeek, subWeeks, subYears, format, startOfDay, endOfDay, eachDayOfInterval, subDays, startOfMonth } from 'date-fns';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const totalEmployees = await this.prisma.employee.count();

        const today = startOfDay(new Date());
        const tomorrow = endOfDay(today);

        const attendancesToday = await this.prisma.attendance.findMany({
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
                clockInTime: 'desc' // Latest first for recent activity
            }
        });

        // 1. Present Count: Unique employees who have clocked in today
        const uniqueEmployeeIds = new Set(attendancesToday.map(a => a.employeeId));
        const presentCount = uniqueEmployeeIds.size;
        const absentCount = totalEmployees - presentCount;

        // 2. Daily Detailed Status: Aggregated per employee
        const allEmployees = await this.prisma.employee.findMany();
        const dailyDetails = allEmployees.map(emp => {
            const empAttendances = attendancesToday.filter(a => a.employeeId === emp.id);

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

            // Sort by time ascending for logic
            const sortedAtt = [...empAttendances].sort((a, b) => a.clockInTime.getTime() - b.clockInTime.getTime());

            const firstClockIn = sortedAtt[0].clockInTime;
            const lastClockOut = sortedAtt[sortedAtt.length - 1].clockOutTime;

            // Status: If ANY session is active (no clockOut), they are currently CLOCKED_IN. 
            // Otherwise if all sessions are closed, they are COMPLETED (or LEFT for the day).
            const isCurrentlyClockedIn = empAttendances.some(a => !a.clockOutTime);
            const status = isCurrentlyClockedIn ? 'CLOCKED_IN' : 'COMPLETED';

            // Total Hours: Sum of all completed sessions + current session duration if active? 
            // Usually for "Total Hours" displayed, we sum completed sessions. 
            // If currently clocked in, we could optionally add partial time, but let's stick to stored totalHours for now 
            // to avoid calc mismatch. The current session usually has null totalHours until release.
            const totalHours = empAttendances.reduce((sum, a) => sum + (a.totalHours || 0), 0);

            // Locations: Collect all unique non-null locations
            const locations = new Set<string>();
            empAttendances.forEach(a => {
                if (a.clockInLocation) locations.add(a.clockInLocation);
                if (a.clockOutLocation) locations.add(a.clockOutLocation);
                // Fallback for legacy location field if needed, though we should prefer clockIn/OutLocation
                if (a.location && !a.clockInLocation && !a.clockOutLocation) locations.add(a.location);
            });

            return {
                id: emp.id,
                name: emp.name,
                employeeId: emp.employeeId,
                status,
                clockIn: firstClockIn,
                clockOut: isCurrentlyClockedIn ? null : lastClockOut, // If still in, don't show final clock out
                totalHours,
                locations: Array.from(locations),
            };
        });

        const chartData: { date: string; present: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(startOfDay(new Date()), i);
            const nextDate = endOfDay(date);

            // For chart data, we also want unique employees per day
            const dailyAtt = await this.prisma.attendance.findMany({
                where: {
                    clockInTime: {
                        gte: date,
                        lt: nextDate,
                    },
                },
                select: { employeeId: true }
            });
            const unique = new Set(dailyAtt.map(a => a.employeeId));

            chartData.push({
                date: format(date, 'yyyy-MM-dd'),
                present: unique.size,
            });
        }

        return {
            totalEmployees,
            present: presentCount,
            absent: Math.max(0, absentCount),
            activeClockIns: attendancesToday.filter(a => !a.clockOutTime).length,
            chartData,
            recentActivity: attendancesToday.slice(0, 5), // Keep latest 5 raw events
            dailyDetails,
        };
    }

    async getEmployeeStats(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                attendances: {
                    orderBy: { clockInTime: 'desc' },
                },
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        const now = new Date();
        const startOfCurMonth = startOfMonth(now);

        const monthlyAttendances = employee.attendances.filter(a => a.clockInTime >= startOfCurMonth);
        const totalMonthlyHours = monthlyAttendances.reduce((acc, a) => acc + (a.totalHours || 0), 0);
        const completedShifts = monthlyAttendances.filter(a => a.clockOutTime).length;
        const avgHoursPerShift = completedShifts > 0 ? totalMonthlyHours / completedShifts : 0;

        // 30-day trend
        const chartData: { date: string; hours: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(startOfDay(now), i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const dayAttendance = employee.attendances.find(a =>
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
                attendances: undefined // Don't send full history again
            },
            stats: {
                totalMonthlyHours: parseFloat(totalMonthlyHours.toFixed(2)),
                avgHoursPerShift: parseFloat(avgHoursPerShift.toFixed(2)),
                totalShifts: completedShifts,
                status: employee.attendances[0] && !employee.attendances[0].clockOutTime ? 'CLOCKED_IN' : 'CLOCKED_OUT',
            },
            history: employee.attendances.slice(0, 30),
            chartData,
        };
    }

    async getWeeklyHistory() {
        const oneYearAgo = subYears(startOfWeek(new Date()), 1);
        const attendances = await this.prisma.attendance.findMany({
            where: {
                clockInTime: { gte: oneYearAgo }
            },
            select: {
                clockInTime: true,
                totalHours: true,
            }
        });

        // Group by week
        const weeklyData: Record<string, { week: string, hours: number, count: number }> = {};

        attendances.forEach(att => {
            const weekStart = format(startOfWeek(att.clockInTime), 'yyyy-MM-dd');
            if (!weeklyData[weekStart]) {
                weeklyData[weekStart] = { week: weekStart, hours: 0, count: 0 };
            }
            weeklyData[weekStart].hours += att.totalHours || 0;
            weeklyData[weekStart].count += 1;
        });

        return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
    }

    async getBiWeeklyPayroll() {
        const now = new Date();
        const periods: { start: Date, end: Date }[] = [];

        // Generate last 4 bi-weekly periods
        let currentEnd = endOfWeek(now);
        for (let i = 0; i < 4; i++) {
            const periodStart = startOfWeek(subWeeks(currentEnd, 1));
            periods.push({ start: periodStart, end: currentEnd });
            currentEnd = endOfDay(subDays(periodStart, 1));
        }

        const payrollData: { period: string, employees: any[] }[] = [];

        for (const period of periods) {
            const attendances = await this.prisma.attendance.findMany({
                where: {
                    clockInTime: { gte: period.start, lte: period.end }
                },
                include: { employee: true }
            });

            const employeePay: Record<string, any> = {};
            attendances.forEach(att => {
                if (!employeePay[att.employeeId]) {
                    employeePay[att.employeeId] = {
                        name: att.employee.name,
                        employeeId: att.employee.employeeId,
                        hours: 0,
                        amount: 0,
                        rate: att.employee.hourlyRate
                    };
                }
                employeePay[att.employeeId].hours += att.totalHours || 0;
                employeePay[att.employeeId].amount += (att.totalHours || 0) * att.employee.hourlyRate;
            });

            payrollData.push({
                period: `${format(period.start, 'MMM dd')} - ${format(period.end, 'MMM dd, yyyy')}`,
                employees: Object.values(employeePay)
            });
        }

        return payrollData;
    }

    async deleteAttendance(id: string) {
        return this.prisma.attendance.delete({ where: { id } });
    }
}

