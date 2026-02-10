import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/reports';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const targetDate = dateStr ? new Date(dateStr) : new Date();

    try {
        const stats = await getDashboardStats(targetDate);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
