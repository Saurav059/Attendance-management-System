import prisma from './prisma';

export async function findEmployee(identifier: string) {
    const trimmedId = identifier.trim();

    // In PostgreSQL (Supabase), we can use mode: 'insensitive' with Prisma
    const employee = await prisma.employee.findFirst({
        where: {
            OR: [
                { employeeId: trimmedId },
                { name: { equals: trimmedId } }
            ]
        }
    });

    return employee;
}
