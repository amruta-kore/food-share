import { Router, Response } from 'express';
import { authenticate, authorize, requireVerified, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import { prisma } from '../prisma/client';
import { sendClaimRequestedEmailToDonor } from '../utils/mailer';

const router = Router();

// Get all requests created by the logged-in NGO (must be verified)
router.get(
  '/my-requests',
  authenticate,
  authorize([Role.NGO]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const requests = await prisma.request.findMany({
        where: { ngoId: userId },
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, organization: true, phone: true } },
              volunteer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(requests);
    } catch (error: any) {
      console.error('Fetch NGO requests error:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }
);

// NGO creates a new request for a donation (must be verified)
router.post(
  '/create',
  authenticate,
  authorize([Role.NGO]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { donationId, quantity, notes } = req.body;

      if (!donationId) {
        return res.status(400).json({ message: 'donationId is required' });
      }

      const donation = await prisma.donation.findUnique({
        where: { id: Number(donationId) },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
        },
      });

      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      if (donation.status === 'DELIVERED' || donation.status === 'COMPLETED') {
        return res.status(400).json({ message: 'This food donation has already been delivered and completed. Other NGOs cannot access or claim it.' });
      }

      if (donation.status !== 'AVAILABLE') {
        return res.status(400).json({ message: `Donation is currently in ${donation.status.toLowerCase()} status and is not available for claiming.` });
      }

      const ngo = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, organization: true },
      });

      const request = await prisma.request.create({
        data: {
          donationId: Number(donationId),
          ngoId: userId,
          quantity: quantity ? Number(quantity) : donation.quantity,
          notes: notes || null,
          status: 'PENDING',
        },
        include: { donation: { include: { donor: true } } },
      });

      // Update donation status to REQUESTED
      await prisma.donation.update({
        where: { id: Number(donationId) },
        data: { status: 'REQUESTED' },
      });

      // Email donor about the new request
      if (donation.donor.email) {
        await sendClaimRequestedEmailToDonor(
          donation.donor.email,
          donation.donor.name,
          ngo?.name || 'An NGO',
          ngo?.organization || ngo?.name || 'An NGO',
          donation.foodName,
          quantity ? Number(quantity) : donation.quantity
        );
      }

      res.status(201).json(request);
    } catch (error: any) {
      console.error('Create request error:', error);
      res.status(500).json({ error: error?.message || 'Failed to create request' });
    }
  }
);

// NGO marks food as received / completed (must be verified)
router.post(
  '/receive/:donationId',
  authenticate,
  authorize([Role.NGO]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.donationId);
      const ngoId = req.user!.id;

      // Verify this donation was claimed by this NGO
      const request = await prisma.request.findFirst({
        where: {
          donationId,
          ngoId,
        },
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, email: true } },
              volunteer: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (!request) {
        return res.status(404).json({ error: 'Donation request not found for your organization' });
      }

      // Update donation status to COMPLETED
      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'COMPLETED' },
      });

      const ngo = await prisma.user.findUnique({
        where: { id: ngoId },
        select: { name: true, organization: true },
      });

      const ngoName = ngo?.organization || ngo?.name || 'NGO';

      // Import mailer helper
      const { sendDeliveryStatusUpdateEmail } = await import('../utils/mailer');

      // Email donor that NGO confirmed receipt
      if (request.donation.donor?.email) {
        await sendDeliveryStatusUpdateEmail(
          request.donation.donor.email,
          request.donation.donor.name,
          request.donation.foodName,
          'COMPLETED (Confirmed Received by NGO)',
          ngoName
        );
      }

      // Email volunteer that delivery has been confirmed by NGO
      if (request.donation.volunteer?.email) {
        await sendDeliveryStatusUpdateEmail(
          request.donation.volunteer.email,
          request.donation.volunteer.name,
          request.donation.foodName,
          'COMPLETED (Confirmed Received by NGO)',
          ngoName
        );
      }

      res.json({ message: 'Delivery successfully confirmed as received', donation: updated });
    } catch (error: any) {
      console.error('NGO receive delivery error:', error);
      res.status(500).json({ error: 'Failed to confirm delivery' });
    }
  }
);

export default router;
