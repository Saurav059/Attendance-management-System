import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { startOfDay, endOfDay, parseISO, isValid, differenceInMinutes } from 'date-fns';

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, date, clockIn, clockOut, reason, location } = body;

        if (!employeeId || !date || !clockIn || !reason) {
            return NextResponse.json({ error: 'Missing required fields: employeeId, date, clockIn, reason' }, { status: 400 });
        }

        // Fetch the actual database ID of the employee
        const employeeRecord = await prisma.employee.findUnique({
            where: { employeeId: employeeId }
        });

        if (!employeeRecord) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Combine date and time, forcing Nepal timezone (+05:45) so UTC servers (like Vercel) parse it correctly
        const clockInDateTime = new Date(`${date}T${clockIn}:00+05:45`);
        let clockOutDateTime = null;

        if (clockOut) {
            clockOutDateTime = new Date(`${date}T${clockOut}:00+05:45`);
            if (clockOutDateTime <= clockInDateTime) {
                return NextResponse.json({ error: 'Clock out time must be after clock in time' }, { status: 400 });
            }
        }

        const selectedDate = new Date(`${date}T00:00:00+05:45`);
        if (isNaN(selectedDate.getTime()) || isNaN(clockInDateTime.getTime()) || (clockOutDateTime && isNaN(clockOutDateTime.getTime()))) {
            return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
        }

        // Calculate duration based on the new times
        let totalHours = null;
        if (clockOutDateTime) {
            const durationMinutes = differenceInMinutes(clockOutDateTime, clockInDateTime);
            totalHours = Math.max(0, durationMinutes / 60); // Ensure duration is not negative (though check above should prevent it)
        }

        const operatorEmail = session.email || 'SYSTEM';

        // Calculate exactly 24 hours for the Nepal timezone day boundary
        const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);

        // Check if attendance exists for that employee on that specific date
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employeeRecord.id,
                clockInTime: {
                    gte: selectedDate,
                    lt: nextDay
                }
            }
        });

        const updateData = {
            clockInTime: clockInDateTime,
            clockOutTime: clockOutDateTime,
            totalHours,
            location: location || null,
            clockInLocation: location || undefined,
            clockOutLocation: location || undefined,
            isManuallyEdited: true,
            editedBy: operatorEmail,
            editedAt: new Date(),
            editReason: reason,
        };

        if (existingAttendance) {
            // Update existing
            const updated = await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: updateData
            });
            return NextResponse.json(updated);
        } else {
            // Create new
            const created = await prisma.attendance.create({
                data: {
                    employeeId: employeeRecord.id,
                    ...updateData,
                    status: 'PRESENT'
                }
            });
            return NextResponse.json(created);
        }

    } catch (error: any) {
        console.error('Attendance Patch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
