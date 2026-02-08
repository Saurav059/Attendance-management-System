import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    clockIn(identifier: string, location?: string): any;
    clockOut(identifier: string, location?: string): any;
    getHistory(employeeId: string): any;
}
