import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Sanitize numbers
        if (data.hourlyRate) data.hourlyRate = parseFloat(data.hourlyRate);
        if (data.maxHoursPerWeek) data.maxHoursPerWeek = parseFloat(data.maxHoursPerWeek);

        // Sanitize dates
        if (data.joinDate) data.joinDate = new Date(data.joinDate);
        if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);

        // Remove legacy fields if active in frontend state
        delete data.department;
        delete data.position;

        const employee = await prisma.employee.update({
            where: { id },
            data,
        });
        return NextResponse.json(employee);
    } catch (error: any) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.employee.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
