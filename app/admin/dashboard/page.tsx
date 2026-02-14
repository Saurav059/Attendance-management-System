import { getDashboardStats, getBiWeeklyPayroll } from '@/lib/reports';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // Data will be fetched on the client side to prevent UI blocking
    return (
        <DashboardClient
            initialStats={null}
            initialEmployees={[]}
            initialPayrollData={[]}
            initialWeeklyTrend={[]}
            userEmail={session.email}
        />
    );
}
