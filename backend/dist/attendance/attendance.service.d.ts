import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    private findEmployee;
    clockIn(identifier: string, location?: string): Promise<any>;
    clockOut(identifier: string, location?: string): Promise<any>;
    getHistory(identifier: string): Promise<any>;
}
