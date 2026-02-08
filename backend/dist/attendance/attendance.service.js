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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findEmployee(identifier) {
        const trimmedId = identifier.trim();
        const employees = await this.prisma.$queryRaw `
            SELECT * FROM "Employee" 
            WHERE "employeeId" = ${trimmedId} 
            OR LOWER("name") = LOWER(${trimmedId}) 
            LIMIT 1
        `;
        if (!employees || employees.length === 0) {
            return null;
        }
        return employees[0];
    }
    async clockIn(identifier, location) {
        console.log(`[Attendance] Clock-in attempt: ${identifier}`);
        const employee = await this.findEmployee(identifier);
        if (!employee) {
            console.warn(`[Attendance] Clock-in FAILED: No employee found for "${identifier}"`);
            throw new common_1.NotFoundException('Employee not found');
        }
        const activeAttendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockOutTime: null,
            },
        });
        if (activeAttendance) {
            console.warn(`[Attendance] Clock-in FAILED: ${employee.name} already clocked in`);
            throw new common_1.BadRequestException('Already clocked in');
        }
        console.log(`[Attendance] ${employee.name} clocking in...`);
        return this.prisma.attendance.create({
            data: {
                employeeId: employee.id,
                clockInTime: new Date(),
                location: location || null,
                clockInLocation: location || null,
                status: 'PRESENT',
            },
        });
    }
    async clockOut(identifier, location) {
        console.log(`[Attendance] Clock-out attempt: ${identifier}`);
        const employee = await this.findEmployee(identifier);
        if (!employee) {
            console.warn(`[Attendance] Clock-out FAILED: No employee found for "${identifier}"`);
            throw new common_1.NotFoundException('Employee not found');
        }
        const activeAttendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockOutTime: null,
            },
        });
        if (!activeAttendance) {
            console.warn(`[Attendance] Clock-out FAILED: ${employee.name} is not clocked in`);
            throw new common_1.BadRequestException('Not clocked in');
        }
        const clockOutTime = new Date();
        const durationMs = clockOutTime.getTime() - activeAttendance.clockInTime.getTime();
        const totalHours = durationMs / (1000 * 60 * 60);
        console.log(`[Attendance] ${employee.name} clocking out (${totalHours.toFixed(2)}h)`);
        return this.prisma.attendance.update({
            where: { id: activeAttendance.id },
            data: {
                clockOutTime,
                totalHours,
                clockOutLocation: location || null,
            },
            include: {
                employee: true,
            }
        });
    }
    async getHistory(identifier) {
        const employee = await this.findEmployee(identifier);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.prisma.attendance.findMany({
            where: { employeeId: employee.id },
            orderBy: { clockInTime: 'desc' },
            take: 30,
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map