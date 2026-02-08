import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEmployeeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsNumber()
    @Min(0)
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
