import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    private async findEmployee(identifier: string) {
        // SQLite case-insensitive lookup using raw query
        // "identifier" can be employeeId (exact match usually) or name (case insensitive)
        const trimmedId = identifier.trim();
        const employees = await this.prisma.$queryRaw<any[]>`
            SELECT * FROM "Employee" 
            WHERE "employeeId" = ${trimmedId} 
            OR LOWER("name") = LOWER(${trimmedId}) 
            LIMIT 1
        `;

        if (!employees || employees.length === 0) {
            return null;
        }

        // Prisma queryRaw returns dates as strings sometimes depending on driver, 
        // but we only need ID and Name for the logic below, which are strings.
        // However, if we need the full object typed correctly, we can fetch it by ID now.
        // But for efficiency, let's just use the result if it has what we need.
        // The result will have keys as in DB (usually camelCase for Prisma generated DBs or exact column names)
        // With Prisma + SQLite, column names match model fields if mapped correctly.
        return employees[0];
    }

    async clockIn(identifier: string, location?: string) {
        console.log(`[Attendance] Clock-in attempt: ${identifier}`);
        const employee = await this.findEmployee(identifier);

        if (!employee) {
            console.warn(`[Attendance] Clock-in FAILED: No employee found for "${identifier}"`);
            throw new NotFoundException('Employee not found');
        }

        const activeAttendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockOutTime: null,
            },
        });

        if (activeAttendance) {
            console.warn(`[Attendance] Clock-in FAILED: ${employee.name} already clocked in`);
            throw new BadRequestException('Already clocked in');
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

    async clockOut(identifier: string, location?: string) {
        console.log(`[Attendance] Clock-out attempt: ${identifier}`);
        const employee = await this.findEmployee(identifier);

        if (!employee) {
            console.warn(`[Attendance] Clock-out FAILED: No employee found for "${identifier}"`);
            throw new NotFoundException('Employee not found');
        }

        const activeAttendance = await this.prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockOutTime: null,
            },
        });

        if (!activeAttendance) {
            console.warn(`[Attendance] Clock-out FAILED: ${employee.name} is not clocked in`);
            throw new BadRequestException('Not clocked in');
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
                employee: true, // This is fine
            }
        });
    }

    async getHistory(identifier: string) {
        const employee = await this.findEmployee(identifier);

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }
        return this.prisma.attendance.findMany({
            where: { employeeId: employee.id },
            orderBy: { clockInTime: 'desc' },
            take: 30,
        });
    }
}
