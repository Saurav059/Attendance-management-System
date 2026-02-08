import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsOptional()
    employeeId?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsNumber()
    @IsOptional()
    hourlyRate?: number;

    @IsString()
    @IsOptional()
    position?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    dateOfBirth?: string;

    @IsString()
    @IsOptional()
    joinDate?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;
}
