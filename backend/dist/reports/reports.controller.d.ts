import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(): any;
    getEmployeeStats(id: string): any;
    getWeeklyHistory(): any;
    getBiWeeklyPayroll(): any;
    deleteAttendance(id: string): any;
}
