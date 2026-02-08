import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateEmployeeDto): Promise<any>;
    findAll(): any;
    findOne(id: string): any;
    update(id: string, data: UpdateEmployeeDto): any;
    remove(id: string): Promise<any>;
}
