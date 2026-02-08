import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('clock-in')
    clockIn(@Body('identifier') identifier: string, @Body('location') location?: string) {
        return this.attendanceService.clockIn(identifier, location);
    }

    @Post('clock-out')
    clockOut(@Body('identifier') identifier: string, @Body('location') location?: string) {
        return this.attendanceService.clockOut(identifier, location);
    }

    @Get(':employeeId')
    getHistory(@Param('employeeId') employeeId: string) {
        return this.attendanceService.getHistory(employeeId);
    }
}
