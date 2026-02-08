import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateEmployeeDto) {
        if (!data.employeeId) {
            data.employeeId = `EMP${Date.now()}`;
        }
        return this.prisma.employee.create({
            data: {
                ...data,
                employeeId: data.employeeId as string,
                role: data.role || 'EMPLOYEE',
                department: data.department || null,
                position: data.position || null,
                location: data.location || null,
                gender: data.gender || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
                phoneNumber: data.phoneNumber || null,
                hourlyRate: data.hourlyRate || 0,
            } as any
        });
    }

    findAll() {
        return this.prisma.employee.findMany();
    }

    findOne(id: string) {
        return this.prisma.employee.findUnique({ where: { id } });
    }

    update(id: string, data: UpdateEmployeeDto) {
        return this.prisma.employee.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        console.log(`Attempting to remove employee with ID: ${id}`);
        try {
            return await this.prisma.employee.delete({ where: { id } });
        } catch (error) {
            console.error(`Failed to remove employee ${id}:`, error);
            throw error;
        }
    }
}
