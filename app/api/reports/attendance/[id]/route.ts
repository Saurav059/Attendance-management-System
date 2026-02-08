import { NextResponse } from 'next/server';
import { deleteAttendance } from '@/lib/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deleteAttendance(id);
        return NextResponse.json({ message: 'Attendance record deleted' });
    } catch (error: any) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
