import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalEmployees: any;
        present: number;
        absent: number;
        activeClockIns: any;
        chartData: {
            date: string;
            present: number;
        }[];
        recentActivity: any;
        dailyDetails: any;
    }>;
    getEmployeeStats(id: string): Promise<{
        employee: any;
        stats: {
            totalMonthlyHours: number;
            avgHoursPerShift: number;
            totalShifts: any;
            status: string;
        };
        history: any;
        chartData: {
            date: string;
            hours: number;
        }[];
    }>;
    getWeeklyHistory(): Promise<{
        week: string;
        hours: number;
        count: number;
    }[]>;
    getBiWeeklyPayroll(): Promise<{
        period: string;
        employees: any[];
    }[]>;
    deleteAttendance(id: string): Promise<any>;
}
