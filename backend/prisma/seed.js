import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Get passwords from environment variables (required for production)
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const operatorPassword = process.env.SEED_OPERATOR_PASSWORD;

  if (!adminPassword || !operatorPassword) {
    console.error('❌ Error: SEED_ADMIN_PASSWORD and SEED_OPERATOR_PASSWORD environment variables are required.');
    console.error('   Set these in your .env file before running the seed script.');
    process.exit(1);
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@serviceauto.ro' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@serviceauto.ro',
      passwordHash: passwordHash,
      rol: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create operator user
  const operatorPasswordHash = await bcrypt.hash(operatorPassword, 10);
  const operator = await prisma.user.upsert({
    where: { email: 'operator@serviceauto.ro' },
    update: {},
    create: {
      username: 'operator',
      email: 'operator@serviceauto.ro',
      passwordHash: operatorPasswordHash,
      rol: 'operator',
    },
  });
  console.log('✅ Operator user created:', operator.email);

  // Create demo clients
  const today = new Date();
  const clientsData = [
    {
      name: 'Popescu Ion',
      licensePlate: 'B-123-ABC',
      phoneNumber: '+40722111222',
      email: 'ion.popescu@example.com',
      itpExpirationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    {
      name: 'Ionescu Maria',
      licensePlate: 'B-456-DEF',
      phoneNumber: '+40722333444',
      email: 'maria.ionescu@example.com',
      itpExpirationDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
    },
    {
      name: 'Dumitrescu George',
      licensePlate: 'B-789-GHI',
      phoneNumber: '+40722555666',
      email: 'george.dumitrescu@example.com',
      itpExpirationDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
    },
    {
      name: 'Popa Ana',
      licensePlate: 'B-321-JKL',
      phoneNumber: '+40722777888',
      email: 'ana.popa@example.com',
      itpExpirationDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      name: 'Stanescu Mihai',
      licensePlate: 'B-654-MNO',
      phoneNumber: '+40722999000',
      email: 'mihai.stanescu@example.com',
      itpExpirationDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
    },
  ];

  for (const clientData of clientsData) {
    const client = await prisma.client.upsert({
      where: { licensePlate: clientData.licensePlate },
      update: {},
      create: clientData,
    });
    console.log('✅ Client created:', client.name, '-', client.licensePlate);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
