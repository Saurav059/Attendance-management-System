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

    const stats = await getDashboardStats();
    const employees = await prisma.employee.findMany({
        orderBy: { name: 'asc' }
    });
    const payrollData = await getBiWeeklyPayroll();

    return (
        <DashboardClient
            initialStats={stats}
            initialEmployees={JSON.parse(JSON.stringify(employees))}
            initialPayrollData={JSON.parse(JSON.stringify(payrollData))}
            initialWeeklyTrend={stats.weeklyTrend}
            userEmail={session.email}
        />
    );
}
