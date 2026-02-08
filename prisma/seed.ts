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
            department: 'Engineering',
            hourlyRate: 50,
        },
        {
            employeeId: 'EMP002',
            name: 'Jane Smith',
            role: 'Product Manager',
            department: 'Product',
            hourlyRate: 60,
        },
        {
            employeeId: 'EMP003',
            name: 'Mike Johnson',
            role: 'Designer',
            department: 'Design',
            hourlyRate: 45,
        },
    ];

    for (const emp of employees) {
        const employee = await prisma.employee.upsert({
            where: { employeeId: emp.employeeId },
            update: {},
            create: emp,
        });
        console.log('✅ Created Employee:', employee.name);
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
