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
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
