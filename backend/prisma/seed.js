import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
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
  const operatorPasswordHash = await bcrypt.hash('operator123', 10);
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
      nume: 'Popescu Ion',
      numarInmatriculare: 'B-123-ABC',
      numarTelefon: '+40722111222',
      email: 'ion.popescu@example.com',
      dataExpirareItp: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    {
      nume: 'Ionescu Maria',
      numarInmatriculare: 'B-456-DEF',
      numarTelefon: '+40722333444',
      email: 'maria.ionescu@example.com',
      dataExpirareItp: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
    },
    {
      nume: 'Dumitrescu George',
      numarInmatriculare: 'B-789-GHI',
      numarTelefon: '+40722555666',
      email: 'george.dumitrescu@example.com',
      dataExpirareItp: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
    },
    {
      nume: 'Popa Ana',
      numarInmatriculare: 'B-321-JKL',
      numarTelefon: '+40722777888',
      email: 'ana.popa@example.com',
      dataExpirareItp: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      nume: 'Stanescu Mihai',
      numarInmatriculare: 'B-654-MNO',
      numarTelefon: '+40722999000',
      email: 'mihai.stanescu@example.com',
      dataExpirareItp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
    },
  ];

  for (const clientData of clientsData) {
    const client = await prisma.client.upsert({
      where: { numarInmatriculare: clientData.numarInmatriculare },
      update: {},
      create: clientData,
    });
    console.log('✅ Client created:', client.nume, '-', client.numarInmatriculare);
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
