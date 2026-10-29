import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, authorize, requireVerified, AuthRequest } from '../middleware/auth';
import { Role, DonationStatus } from '@prisma/client';
import { foodImageUpload } from '../utils/uploader';

const router = Router();

// Create a donation – Verified Donor only (supports food photo image upload)
router.post(
  '/',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  (req, res, next) => {
    foodImageUpload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Image upload error' });
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      const donorId = req.user!.id;
      const {
        foodName,
        category,
        isVegetarian,
        quantity,
        servings,
        preparedAt,
        consumeBefore,
        storage,
        pickupAddress,
        city,
        area,
        pickupStart,
        pickupEnd,
        contactPerson,
        contactPhone,
      } = req.body;

      if (!foodName || !quantity || !servings || !pickupAddress || !city || !contactPhone) {
        return res.status(400).json({ error: 'Missing required donation details' });
      }

      // If an image was uploaded via multipart/form-data, use its served URL
      let imageUrl = req.body.imageUrl || null;
      if (req.file) {
        imageUrl = `/uploads/food/${req.file.filename}`;
      }

      const isVeg = isVegetarian !== undefined ? (isVegetarian === 'true' || isVegetarian === true || isVegetarian === '1') : true;

      const donation = await prisma.donation.create({
        data: {
          foodName,
          category: category || 'Cooked Meals',
          isVegetarian: isVeg,
          quantity: Number(quantity),
          servings: Number(servings),
          preparedAt: preparedAt ? new Date(preparedAt) : new Date(),
          consumeBefore: consumeBefore ? new Date(consumeBefore) : new Date(Date.now() + 6 * 3600 * 1000),
          storage: storage || 'Room Temperature',
          imageUrl: imageUrl,
          pickupAddress,
          city: city || 'Pune',
          area: area || 'Central',
          pickupStart: pickupStart ? new Date(pickupStart) : new Date(),
          pickupEnd: pickupEnd ? new Date(pickupEnd) : new Date(Date.now() + 4 * 3600 * 1000),
          contactPerson: contactPerson || 'Kitchen Manager',
          contactPhone,
          donorId,
          status: DonationStatus.AVAILABLE,
        },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
        },
      });

      res.status(201).json(donation);
    } catch (error: any) {
      console.error('Create donation error:', error);
      res.status(500).json({ error: error?.message || 'Failed to create donation' });
    }
  }
);

// Get active and delivered donations (public feed)
router.get('/', async (req, res: Response) => {
  try {
    const { city, isVegetarian, category, status } = req.query as {
      city?: string;
      isVegetarian?: string;
      category?: string;
      status?: string;
    };

    const where: any = {};
    if (status && status !== 'ALL' && status !== 'FEED') {
      where.status = status as DonationStatus;
    } else {
      // Return AVAILABLE as well as DELIVERED/COMPLETED donations so they remain on dashboard!
      where.status = {
        in: [
          DonationStatus.AVAILABLE,
          DonationStatus.DELIVERED,
          DonationStatus.COMPLETED,
          DonationStatus.OUT_FOR_DELIVERY,
          DonationStatus.PICKED_UP,
          DonationStatus.ACCEPTED,
          DonationStatus.REQUESTED,
        ],
      };
    }

    if (city) where.city = { contains: city };
    if (category && category !== 'ALL') where.category = category;
    if (isVegetarian !== undefined && isVegetarian !== 'ALL') {
      where.isVegetarian = isVegetarian === 'true';
    }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, name: true, organization: true } },
        request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
        volunteer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Custom sorting: AVAILABLE donations come first, followed by in-progress and delivered
    // Mask sensitive security handover OTPs from public feed
    const sanitized = donations.map((d) => ({
      ...d,
      pickupOtp: undefined,
      dropoffOtp: undefined,
    }));

    const sorted = sanitized.sort((a, b) => {
      if (a.status === DonationStatus.AVAILABLE && b.status !== DonationStatus.AVAILABLE) return -1;
      if (a.status !== DonationStatus.AVAILABLE && b.status === DonationStatus.AVAILABLE) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json(sorted);
  } catch (error: any) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get a single donation by ID (public)
router.get('/:id', async (req, res: Response) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        donor: { select: { id: true, name: true, organization: true, phone: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
        request: { include: { ngo: { select: { id: true, name: true, organization: true, phone: true } } } },
      },
    });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (error: any) {
    console.error('Fetch donation error:', error);
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

export default router;
