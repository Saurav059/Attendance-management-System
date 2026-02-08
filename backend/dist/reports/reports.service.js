"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const totalEmployees = await this.prisma.employee.count();
        const today = (0, date_fns_1.startOfDay)(new Date());
        const tomorrow = (0, date_fns_1.endOfDay)(today);
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
                clockInTime: 'desc'
            }
        });
        const uniqueEmployeeIds = new Set(attendancesToday.map(a => a.employeeId));
        const presentCount = uniqueEmployeeIds.size;
        const absentCount = totalEmployees - presentCount;
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
            const sortedAtt = [...empAttendances].sort((a, b) => a.clockInTime.getTime() - b.clockInTime.getTime());
            const firstClockIn = sortedAtt[0].clockInTime;
            const lastClockOut = sortedAtt[sortedAtt.length - 1].clockOutTime;
            const isCurrentlyClockedIn = empAttendances.some(a => !a.clockOutTime);
            const status = isCurrentlyClockedIn ? 'CLOCKED_IN' : 'COMPLETED';
            const totalHours = empAttendances.reduce((sum, a) => sum + (a.totalHours || 0), 0);
            const locations = new Set();
            empAttendances.forEach(a => {
                if (a.clockInLocation)
                    locations.add(a.clockInLocation);
                if (a.clockOutLocation)
                    locations.add(a.clockOutLocation);
                if (a.location && !a.clockInLocation && !a.clockOutLocation)
                    locations.add(a.location);
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
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = (0, date_fns_1.subDays)((0, date_fns_1.startOfDay)(new Date()), i);
            const nextDate = (0, date_fns_1.endOfDay)(date);
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
                date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
                present: unique.size,
            });
        }
        return {
            totalEmployees,
            present: presentCount,
            absent: Math.max(0, absentCount),
            activeClockIns: attendancesToday.filter(a => !a.clockOutTime).length,
            chartData,
            recentActivity: attendancesToday.slice(0, 5),
            dailyDetails,
        };
    }
    async getEmployeeStats(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                attendances: {
                    orderBy: { clockInTime: 'desc' },
                },
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const now = new Date();
        const startOfCurMonth = (0, date_fns_1.startOfMonth)(now);
        const monthlyAttendances = employee.attendances.filter(a => a.clockInTime >= startOfCurMonth);
        const totalMonthlyHours = monthlyAttendances.reduce((acc, a) => acc + (a.totalHours || 0), 0);
        const completedShifts = monthlyAttendances.filter(a => a.clockOutTime).length;
        const avgHoursPerShift = completedShifts > 0 ? totalMonthlyHours / completedShifts : 0;
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const date = (0, date_fns_1.subDays)((0, date_fns_1.startOfDay)(now), i);
            const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
            const dayAttendance = employee.attendances.find(a => (0, date_fns_1.format)(a.clockInTime, 'yyyy-MM-dd') === dateStr);
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
            history: employee.attendances.slice(0, 30),
            chartData,
        };
    }
    async getWeeklyHistory() {
        const oneYearAgo = (0, date_fns_1.subYears)((0, date_fns_1.startOfWeek)(new Date()), 1);
        const attendances = await this.prisma.attendance.findMany({
            where: {
                clockInTime: { gte: oneYearAgo }
            },
            select: {
                clockInTime: true,
                totalHours: true,
            }
        });
        const weeklyData = {};
        attendances.forEach(att => {
            const weekStart = (0, date_fns_1.format)((0, date_fns_1.startOfWeek)(att.clockInTime), 'yyyy-MM-dd');
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
        const periods = [];
        let currentEnd = (0, date_fns_1.endOfWeek)(now);
        for (let i = 0; i < 4; i++) {
            const periodStart = (0, date_fns_1.startOfWeek)((0, date_fns_1.subWeeks)(currentEnd, 1));
            periods.push({ start: periodStart, end: currentEnd });
            currentEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(periodStart, 1));
        }
        const payrollData = [];
        for (const period of periods) {
            const attendances = await this.prisma.attendance.findMany({
                where: {
                    clockInTime: { gte: period.start, lte: period.end }
                },
                include: { employee: true }
            });
            const employeePay = {};
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
                period: `${(0, date_fns_1.format)(period.start, 'MMM dd')} - ${(0, date_fns_1.format)(period.end, 'MMM dd, yyyy')}`,
                employees: Object.values(employeePay)
            });
        }
        return payrollData;
    }
    async deleteAttendance(id) {
        return this.prisma.attendance.delete({ where: { id } });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map