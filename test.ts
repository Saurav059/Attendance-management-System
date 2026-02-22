import { PrismaClient } from '@prisma/client';
import { parseISO } from 'date-fns';

const prisma = new PrismaClient();

async function test() {
    const existing = await prisma.attendance.findFirst({
        where: {
            employee: { employeeId: 'EMP006' }
        },
        orderBy: { clockInTime: 'desc' }
    });

    if (!existing) {
        console.log("Not found");
        return;
    }

    console.log("Before:");
    console.log(existing);

    const clockInDateTime = parseISO('2026-02-22T14:30');

    // Attempt the update directly like route.ts does
    const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
            clockInTime: clockInDateTime,
            editReason: "Testing",
        }
    });

    console.log("\nAfter update returned:");
    console.log(updated);

    const check = await prisma.attendance.findUnique({ where: { id: existing.id } });
    console.log("\nFrom DB again:");
    console.log(check);
}

test().catch(console.error).finally(() => prisma.$disconnect());
