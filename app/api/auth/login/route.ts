import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const hrAdmin = await prisma.hrAdmin.findUnique({
            where: { email },
        });

        if (!hrAdmin) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, hrAdmin.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        await login(email);

        return NextResponse.json({ message: 'Logged in successfully' });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
