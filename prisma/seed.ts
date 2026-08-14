import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash(
    'Admin@123',
    10,
  );

  await prisma.user.upsert({
    where: {
      email: 'salamarahma667@gmail.com',
    },

    update: {},

    create: {
      name: 'Administrator',
      email: 'salamarahma667@gmail.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log('✅ Admin created');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });