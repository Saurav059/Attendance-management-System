import { NextResponse } from 'next/server';
import { getEmployeeStats } from '@/lib/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const stats = await getEmployeeStats(id);

        if (!stats) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('Error fetching employee stats:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
