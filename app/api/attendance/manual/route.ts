import { NextRequest, NextResponse } from 'next/server';
import { createManualAttendance } from '@/lib/reports';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { employeeId, clockInTime, clockOutTime, clockInLocation, clockOutLocation, reason } = body;

        if (!employeeId || !clockInTime || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const parseDate = (val: any) => {
            if (!val) return undefined;
            const d = new Date(val);
            if (isNaN(d.getTime())) throw new Error(`Invalid date: ${val}`);
            return d;
        };

        const result = await createManualAttendance({
            employeeId,
            clockInTime: parseDate(clockInTime)!,
            clockOutTime: parseDate(clockOutTime),
            clockInLocation,
            clockOutLocation,
            reason,
            hrEmail: session.email
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error creating manual attendance:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
