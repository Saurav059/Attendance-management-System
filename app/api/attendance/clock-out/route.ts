import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findEmployee } from '@/lib/attendance-logic';

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

        if (!activeAttendance) {
            return NextResponse.json({ message: 'Not clocked in' }, { status: 400 });
        }

        const clockOutTime = new Date();
        const durationMs = clockOutTime.getTime() - activeAttendance.clockInTime.getTime();
        const totalHours = durationMs / (1000 * 60 * 60);

        const attendance = await prisma.attendance.update({
            where: { id: activeAttendance.id },
            data: {
                clockOutTime,
                totalHours,
                clockOutLocation: location || null,
            },
        });

        return NextResponse.json(attendance);
    } catch (error: any) {
        console.error('Clock-out error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
