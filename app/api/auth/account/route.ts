import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { email, password } = await request.json();

        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.hrAdmin.update({
            where: { email: session.email },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Account update error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
