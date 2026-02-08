import { Controller, Get, Param, UseGuards, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('employee/:id')
    getEmployeeStats(@Param('id') id: string) {
        return this.reportsService.getEmployeeStats(id);
    }

    @Get('weekly-history')
    getWeeklyHistory() {
        return this.reportsService.getWeeklyHistory();
    }

    @Get('payroll')
    getBiWeeklyPayroll() {
        return this.reportsService.getBiWeeklyPayroll();
    }

    @Delete('attendance/:id')
    deleteAttendance(@Param('id') id: string) {
        return this.reportsService.deleteAttendance(id);
    }
}
