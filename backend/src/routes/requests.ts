import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Create a food request (NGO role)
router.post('/', authenticate, authorize([Role.NGO]), async (req: AuthRequest, res: Response) => {
  try {
    const ngoId = req.user!.id;
    const { donationId, quantity, notes } = req.body;

    if (!donationId) {
      return res.status(400).json({ error: 'donationId is required' });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: Number(donationId) },
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Donation is no longer available' });
    }

    // Create the request and update donation status to REQUESTED
    const request = await prisma.request.create({
      data: {
        ngoId,
        donationId: Number(donationId),
        quantity: quantity ? Number(quantity) : donation.quantity,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        donation: true,
        ngo: { select: { id: true, name: true, email: true, organization: true } },
      },
    });

    await prisma.donation.update({
      where: { id: Number(donationId) },
      data: { status: 'REQUESTED' },
    });

    res.status(201).json(request);
  } catch (error: any) {
    console.error('Create request error:', error);
    res.status(500).json({ error: error?.message || 'Failed to create request' });
  }
});

// Get all requests (admin or authenticated)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause: any = {};
    if (userRole === Role.NGO) {
      whereClause = { ngoId: userId };
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        donation: {
          include: {
            donor: { select: { id: true, name: true, organization: true, contactPhone: true } as any },
          },
        },
        ngo: { select: { id: true, name: true, email: true, organization: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Update request status (Donor can accept/reject; NGO/Volunteer can complete)
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body; // 'ACCEPTED', 'REJECTED', 'COMPLETED'

    const existing = await prisma.request.findUnique({
      where: { id: requestId },
      include: { donation: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { status },
      include: { donation: true },
    });

    if (status === 'ACCEPTED') {
      await prisma.donation.update({
        where: { id: existing.donationId },
        data: { status: 'ACCEPTED' },
      });
    } else if (status === 'REJECTED') {
      await prisma.donation.update({
        where: { id: existing.donationId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

export default router;
