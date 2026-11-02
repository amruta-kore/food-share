import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // AnnaSetu Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@annasetu.org' },
    update: {
      role: Role.ADMIN,
      verified: true,
      name: 'AnnaSetu System Admin',
      organization: 'AnnaSetu Headquarters',
    },
    create: {
      name: 'AnnaSetu System Admin',
      email: 'admin@annasetu.org',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      verified: true,
      organization: 'AnnaSetu Headquarters',
      phone: '+91 9999999999',
    },
  });

  // Backward compatible FoodShare Admin
  await prisma.user.upsert({
    where: { email: 'admin@foodshare.org' },
    update: {
      role: Role.ADMIN,
      verified: true,
      name: 'AnnaSetu System Admin',
      organization: 'AnnaSetu Headquarters',
    },
    create: {
      name: 'AnnaSetu System Admin',
      email: 'admin@foodshare.org',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      verified: true,
      organization: 'AnnaSetu Headquarters',
      phone: '+91 9999999999',
    },
  });

  console.log(`✅ Default Admin user ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
