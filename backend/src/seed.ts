import { prisma } from './prisma/client';
import bcrypt from 'bcrypt';
import { Role, DonationStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Seeding demo data for FoodShare platform...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create or update Demo Users
  const donor = await prisma.user.upsert({
    where: { email: 'donor.demo@foodshare.org' },
    update: {},
    create: {
      name: 'Rajesh Sharma',
      email: 'donor.demo@foodshare.org',
      passwordHash,
      role: Role.DONOR,
      organization: 'Grand Regency Caterers & Banquets',
      phone: '+91 98220 12345',
      verified: true,
    },
  });

  const ngo = await prisma.user.upsert({
    where: { email: 'ngo.demo@foodshare.org' },
    update: {},
    create: {
      name: 'Priya Deshmukh',
      email: 'ngo.demo@foodshare.org',
      passwordHash,
      role: Role.NGO,
      organization: 'Hope Shelter & Nutrition Foundation',
      phone: '+91 98901 67890',
      verified: true,
    },
  });

  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer.demo@foodshare.org' },
    update: {},
    create: {
      name: 'Amit Kulkarni',
      email: 'volunteer.demo@foodshare.org',
      passwordHash,
      role: Role.VOLUNTEER,
      organization: 'City Rapid Food Couriers (Two-Wheeler)',
      phone: '+91 97654 32109',
      verified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin.demo@foodshare.org' },
    update: {},
    create: {
      name: 'Amruta Admin',
      email: 'admin.demo@foodshare.org',
      passwordHash,
      role: Role.ADMIN,
      organization: 'FoodShare Foundation',
      phone: '+91 98000 11223',
      verified: true,
    },
  });

  console.log('✅ Demo users verified.');

  // 2. Add sample surplus food donations
  const donationCount = await prisma.donation.count();
  if (donationCount === 0) {
    const d1 = await prisma.donation.create({
      data: {
        foodName: 'Vegetable Biryani & Dal Makhani',
        category: 'Cooked Meals',
        isVegetarian: true,
        quantity: 18.5,
        servings: 45,
        preparedAt: new Date(Date.now() - 2 * 3600 * 1000),
        consumeBefore: new Date(Date.now() + 6 * 3600 * 1000),
        storage: 'Hot Box (Safe Warm Storage)',
        pickupAddress: 'Kitchen Bay 3, Grand Regency Banquets, JM Road',
        city: 'Pune',
        area: 'Shivajinagar',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 4 * 3600 * 1000),
        contactPerson: 'Chef Rajesh',
        contactPhone: '+91 98220 12345',
        status: DonationStatus.AVAILABLE,
        donorId: donor.id,
      },
    });

    const d2 = await prisma.donation.create({
      data: {
        foodName: 'Fresh Butter Croissants & Baguettes',
        category: 'Bakery & Bread',
        isVegetarian: true,
        quantity: 8.0,
        servings: 35,
        preparedAt: new Date(Date.now() - 4 * 3600 * 1000),
        consumeBefore: new Date(Date.now() + 18 * 3600 * 1000),
        storage: 'Room Temperature (Dry Packaging)',
        pickupAddress: 'Bakehouse Central, North Main Road, Koregaon Park',
        city: 'Pune',
        area: 'Koregaon Park',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 8 * 3600 * 1000),
        contactPerson: 'Manager Anita',
        contactPhone: '+91 98220 54321',
        status: DonationStatus.AVAILABLE,
        donorId: donor.id,
      },
    });

    const d3 = await prisma.donation.create({
      data: {
        foodName: 'Chicken Curry & Steamed Jeera Rice',
        category: 'Cooked Meals',
        isVegetarian: false,
        quantity: 14.0,
        servings: 30,
        preparedAt: new Date(Date.now() - 1 * 3600 * 1000),
        consumeBefore: new Date(Date.now() + 5 * 3600 * 1000),
        storage: 'Refrigerated Container',
        pickupAddress: 'Spice Symphony Kitchen, Baner Road',
        city: 'Pune',
        area: 'Baner',
        pickupStart: new Date(),
        pickupEnd: new Date(Date.now() + 4 * 3600 * 1000),
        contactPerson: 'Suresh Patil',
        contactPhone: '+91 98220 99887',
        status: DonationStatus.AVAILABLE,
        donorId: donor.id,
      },
    });

    console.log('✅ Created 3 sample surplus food donations.');
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
