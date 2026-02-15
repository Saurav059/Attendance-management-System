import { NextRequest, NextResponse } from 'next/server';
import { editAttendanceRecord } from '@/lib/reports';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { attendanceId, clockInTime, clockOutTime, clockInLocation, clockOutLocation, reason } = body;

        if (!attendanceId || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const parseDate = (val: any) => {
            if (val === undefined || val === null || val === '') return undefined;
            const d = new Date(val);
            if (isNaN(d.getTime())) throw new Error(`Invalid date: ${val}`);
            return d;
        };

        const result = await editAttendanceRecord({
            attendanceId,
            clockInTime: parseDate(clockInTime),
            clockOutTime: parseDate(clockOutTime),
            clockInLocation,
            clockOutLocation,
            reason,
            hrEmail: session.email
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error editing attendance:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
