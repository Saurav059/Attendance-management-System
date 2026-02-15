import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default HR Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const hrAdmin = await prisma.hrAdmin.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            password: hashedPassword,
        },
    });

    console.log('✅ Created HR Admin:', hrAdmin.email);

    // Create sample employees
    const employees = [
        {
            employeeId: 'EMP001',
            name: 'John Doe',
            role: 'Software Engineer',
            maxHoursPerWeek: 40,
            hourlyRate: 50,
        },
        {
            employeeId: 'EMP002',
            name: 'Jane Smith',
            role: 'Product Manager',
            maxHoursPerWeek: 40,
            hourlyRate: 60,
        },
        {
            employeeId: 'EMP003',
            name: 'Mike Johnson',
            role: 'Designer',
            maxHoursPerWeek: 40,
            hourlyRate: 45,
        },
        {
            employeeId: 'EMP004',
            name: 'Sarah Williams',
            role: 'HR Manager',
            maxHoursPerWeek: 40,
            hourlyRate: 55,
        },
        {
            employeeId: 'EMP005',
            name: 'Robert Brown',
            role: 'DevOps Engineer',
            maxHoursPerWeek: 40,
            hourlyRate: 52,
        },
    ];

    const createdEmployees = [];
    for (const emp of employees) {
        const employee = await prisma.employee.upsert({
            where: { employeeId: emp.employeeId },
            update: {},
            create: emp,
        });
        createdEmployees.push(employee);
        console.log('✅ Created Employee:', employee.name);
    }

    // Create sample attendance records for the last 7 days
    console.log('📅 Creating attendance records...');
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Skip weekends for random seeding (optional, but makes it look more realistic)
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const emp of createdEmployees) {
            // Randomly decide if employee was present (80% chance)
            if (Math.random() > 0.2) {
                const clockIn = new Date(date);
                clockIn.setHours(9, Math.floor(Math.random() * 30), 0); // Around 9 AM

                const clockOut = new Date(date);
                clockOut.setHours(17, Math.floor(Math.random() * 30), 0); // Around 5 PM

                const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

                await prisma.attendance.create({
                    data: {
                        employeeId: emp.id,
                        clockInTime: clockIn,
                        clockOutTime: clockOut,
                        totalHours: totalHours,
                        status: 'PRESENT',
                        clockInLocation: 'Main Office',
                        clockOutLocation: 'Main Office',
                    }
                });
            }
        }
    }

    console.log('🎉 Seeding completed!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
