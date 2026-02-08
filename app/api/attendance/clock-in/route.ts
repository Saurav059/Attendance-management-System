import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findEmployee } from '@/lib/attendance-logic';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST(request: Request) {
    try {
        const { identifier, location } = await request.json();

        if (!identifier) {
            return NextResponse.json({ message: 'Employee identifier is required' }, { status: 400 });
        }

        const employee = await findEmployee(identifier);

        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        const activeAttendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                clockOutTime: null,
            },
        });

        if (activeAttendance) {
            return NextResponse.json({ message: 'Already clocked in' }, { status: 400 });
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: employee.id,
                clockInTime: new Date(),
                location: location || null,
                clockInLocation: location || null,
                status: 'PRESENT',
            },
        });

        return NextResponse.json(attendance);
    } catch (error: any) {
        console.error('Clock-in error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
