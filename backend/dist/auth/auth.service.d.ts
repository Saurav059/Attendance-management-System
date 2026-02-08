import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: any;
    }>;
    register(email: string, pass: string): Promise<any>;
    updateAccount(id: string, data: {
        email?: string;
        password?: string;
    }): Promise<any>;
}
