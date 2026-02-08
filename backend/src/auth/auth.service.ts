import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.hrAdmin.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(email: string, pass: string) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        return this.prisma.hrAdmin.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
    }

    async updateAccount(id: string, data: { email?: string, password?: string }) {
        const updateData: any = {};
        if (data.email) updateData.email = data.email;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        try {
            return await this.prisma.hrAdmin.update({
                where: { id },
                data: updateData,
            });
        } catch (error) {
            Logger.error(`Update Account Error: ID=${id}, Code=${error.code}, Message=${error.message}`, 'AuthService');

            if (error.code === 'P2002') {
                throw new ConflictException('Email already in use');
            }
            if (error.code === 'P2025') {
                throw new NotFoundException('Account not found');
            }
            // Throw specific error message to help debug
            throw new BadRequestException(`Update Failed: ${error.message}`);
        }
    }
}
