"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmployeesService = class EmployeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        if (!data.employeeId) {
            data.employeeId = `EMP${Date.now()}`;
        }
        return this.prisma.employee.create({
            data: {
                ...data,
                employeeId: data.employeeId,
                role: data.role || 'EMPLOYEE',
                department: data.department || null,
                position: data.position || null,
                location: data.location || null,
                gender: data.gender || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
                phoneNumber: data.phoneNumber || null,
                hourlyRate: data.hourlyRate || 0,
            }
        });
    }
    findAll() {
        return this.prisma.employee.findMany();
    }
    findOne(id) {
        return this.prisma.employee.findUnique({ where: { id } });
    }
    update(id, data) {
        return this.prisma.employee.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        console.log(`Attempting to remove employee with ID: ${id}`);
        try {
            return await this.prisma.employee.delete({ where: { id } });
        }
        catch (error) {
            console.error(`Failed to remove employee ${id}:`, error);
            throw error;
        }
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map