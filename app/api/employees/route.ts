import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(employees);
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Sanitize and convert types
        if (data.hourlyRate) {
            data.hourlyRate = parseFloat(data.hourlyRate);
        }

        if (data.joinDate) {
            data.joinDate = new Date(data.joinDate);
        }

        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }

        // Auto-generate employee ID if not provided
        if (!data.employeeId) {
            const count = await prisma.employee.count();
            data.employeeId = `EMP${(count + 1).toString().padStart(3, '0')}`;
        }

        const employee = await prisma.employee.create({
            data,
        });

        return NextResponse.json(employee);
    } catch (error: any) {
        console.error('Error creating employee:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Employee ID already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
