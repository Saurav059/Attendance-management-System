import { NextRequest, NextResponse } from 'next/server';
import { getBiWeeklyPayroll } from '@/lib/reports';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payroll = await getBiWeeklyPayroll();
        return NextResponse.json(payroll);
    } catch (error: any) {
        console.error('Error fetching payroll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
