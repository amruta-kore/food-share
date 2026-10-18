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

// Get all active donations (public, no auth required)
router.get('/', async (req, res: Response) => {
  try {
    const { city, isVegetarian, category, status } = req.query as {
      city?: string;
      isVegetarian?: string;
      category?: string;
      status?: DonationStatus;
    };

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      where.status = DonationStatus.AVAILABLE;
    }

    if (city) where.city = { contains: city };
    if (category) where.category = category;
    if (isVegetarian !== undefined) where.isVegetarian = isVegetarian === 'true';

    const donations = await prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, name: true, organization: true } },
        request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(donations);
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
