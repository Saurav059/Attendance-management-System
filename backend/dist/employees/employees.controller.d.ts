import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto): any;
    findAll(): any;
    findOne(id: string): any;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): any;
    remove(id: string): any;
}
