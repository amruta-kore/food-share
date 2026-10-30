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

// Edit a donation – Verified Donor only (only allowed if food is still AVAILABLE or REQUESTED before courier assignment)
router.put(
  '/:id',
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
      const donationId = Number(req.params.id);
      const donorId = req.user!.id;

      const existing = await prisma.donation.findUnique({
        where: { id: donationId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      if (existing.donorId !== donorId) {
        return res.status(403).json({ error: 'Unauthorized: You can only edit your own donations' });
      }

      // Check if food has already been claimed and assigned to a volunteer courier or beyond
      if (
        existing.status === DonationStatus.VOLUNTEER_ASSIGNED ||
        existing.status === DonationStatus.PICKED_UP ||
        existing.status === DonationStatus.OUT_FOR_DELIVERY ||
        existing.status === DonationStatus.DELIVERED ||
        existing.status === DonationStatus.COMPLETED
      ) {
        return res.status(400).json({
          error: `Cannot edit this donation because it is already in '${existing.status}' status (courier is already coordinating or food has been picked up/delivered).`,
        });
      }

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
        contactPerson,
        contactPhone,
      } = req.body;

      const updateData: any = {};
      if (foodName) updateData.foodName = foodName;
      if (category) updateData.category = category;
      if (isVegetarian !== undefined) {
        updateData.isVegetarian = isVegetarian === 'true' || isVegetarian === true || isVegetarian === '1';
      }
      if (quantity) updateData.quantity = Number(quantity);
      if (servings) updateData.servings = Number(servings);
      if (preparedAt) updateData.preparedAt = new Date(preparedAt);
      if (consumeBefore) updateData.consumeBefore = new Date(consumeBefore);
      if (storage) updateData.storage = storage;
      if (pickupAddress) updateData.pickupAddress = pickupAddress;
      if (city) updateData.city = city;
      if (area) updateData.area = area;
      if (contactPerson) updateData.contactPerson = contactPerson;
      if (contactPhone) updateData.contactPhone = contactPhone;

      if (req.file) {
        updateData.imageUrl = `/uploads/food/${req.file.filename}`;
      } else if (req.body.imageUrl !== undefined) {
        updateData.imageUrl = req.body.imageUrl || null;
      }

      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: updateData,
        include: {
          donor: { select: { id: true, name: true, organization: true } },
          request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
        },
      });

      res.json({ message: 'Donation successfully updated', donation: updated });
    } catch (error: any) {
      console.error('Update donation error:', error);
      res.status(500).json({ error: error?.message || 'Failed to update donation' });
    }
  }
);

// Delete a donation – Verified Donor only (only allowed if food is still AVAILABLE or REQUESTED before courier assignment)
router.delete(
  '/:id',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.id);
      const donorId = req.user!.id;

      const existing = await prisma.donation.findUnique({
        where: { id: donationId },
        include: { request: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      if (existing.donorId !== donorId) {
        return res.status(403).json({ error: 'Unauthorized: You can only delete your own donations' });
      }

      // Check if food has already been claimed and assigned to a volunteer courier or beyond
      if (
        existing.status === DonationStatus.VOLUNTEER_ASSIGNED ||
        existing.status === DonationStatus.PICKED_UP ||
        existing.status === DonationStatus.OUT_FOR_DELIVERY ||
        existing.status === DonationStatus.DELIVERED ||
        existing.status === DonationStatus.COMPLETED
      ) {
        return res.status(400).json({
          error: `Cannot delete this donation because it is already in '${existing.status}' status. Couriers are actively transporting or food has been received.`,
        });
      }

      // If there's an associated pending/requested Request record, remove it first
      if (existing.request) {
        await prisma.request.delete({
          where: { id: existing.request.id },
        });
      }

      // Now delete the donation
      await prisma.donation.delete({
        where: { id: donationId },
      });

      res.json({ message: 'Donation successfully deleted' });
    } catch (error: any) {
      console.error('Delete donation error:', error);
      res.status(500).json({ error: error?.message || 'Failed to delete donation' });
    }
  }
);

export default router;
