import { Router, Response } from 'express';
import { authenticate, authorize, requireVerified, AuthRequest } from '../middleware/auth';
import { Role, DonationStatus } from '@prisma/client';
import { prisma } from '../prisma/client';
import { sendVolunteerAssignedEmail, sendDeliveryStatusUpdateEmail } from '../utils/mailer';

const router = Router();

// Get open delivery opportunities and volunteer's current tasks (must be verified)
router.get(
  '/tasks',
  authenticate,
  authorize([Role.VOLUNTEER]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const volunteerId = req.user!.id;

      // Available tasks to claim: donations accepted by donor and awaiting volunteer
      const availableForPickup = await prisma.donation.findMany({
        where: {
          status: DonationStatus.ACCEPTED,
          volunteerId: null,
        },
        include: {
          donor: { select: { id: true, name: true, organization: true } },
          request: { include: { ngo: { select: { id: true, name: true, organization: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Volunteer's active tasks
      const myTasks = await prisma.donation.findMany({
        where: { volunteerId },
        include: {
          donor: { select: { id: true, name: true, organization: true } },
          request: { include: { ngo: { select: { id: true, name: true, organization: true, phone: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.json({ availableForPickup, myTasks });
    } catch (error: any) {
      console.error('Fetch volunteer tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch volunteer tasks' });
    }
  }
);

// Volunteer claims a delivery task (must be verified)
router.post(
  '/claim/:donationId',
  authenticate,
  authorize([Role.VOLUNTEER]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.donationId);
      const volunteerId = req.user!.id;

      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
      });

      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      if (donation.volunteerId) {
        return res.status(400).json({ error: 'Task has already been claimed by another volunteer' });
      }

      // Generate secure 4-digit numeric OTPs for chain-of-custody verification
      const generatedPickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedDropoffOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: {
          volunteerId,
          status: DonationStatus.VOLUNTEER_ASSIGNED,
          pickupOtp: generatedPickupOtp,
          dropoffOtp: generatedDropoffOtp,
        },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
          request: { include: { ngo: { select: { id: true, name: true, email: true, organization: true, phone: true } } } },
        },
      });

      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId },
        select: { name: true, phone: true },
      });

      // Email donor about volunteer assignment
      if (updated.donor?.email) {
        await sendVolunteerAssignedEmail(
          updated.donor.email,
          updated.donor.name,
          volunteer?.name || 'A volunteer',
          volunteer?.phone || '',
          updated.foodName
        );
      }

      // Email NGO about volunteer assignment
      if (updated.request?.ngo?.email) {
        await sendVolunteerAssignedEmail(
          updated.request.ngo.email,
          updated.request.ngo.name,
          volunteer?.name || 'A volunteer',
          volunteer?.phone || '',
          updated.foodName
        );
      }

      res.json(updated);
    } catch (error: any) {
      console.error('Claim delivery task error:', error);
      res.status(500).json({ error: 'Failed to claim delivery task' });
    }
  }
);

// Volunteer updates delivery status (must be verified)
router.patch(
  '/status/:donationId',
  authenticate,
  authorize([Role.VOLUNTEER]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.donationId);
      const volunteerId = req.user!.id;
      const { status } = req.body;

      const donation = await prisma.donation.findUnique({ where: { id: donationId } });

      if (!donation || donation.volunteerId !== volunteerId) {
        return res.status(403).json({ error: 'Unauthorized or donation not assigned to you' });
      }

      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: { status },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
          request: { include: { ngo: { select: { id: true, name: true, email: true, organization: true } } } },
        },
      });

      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId },
        select: { name: true },
      });

      const volunteerName = volunteer?.name || 'Volunteer';

      // Email donor on status change
      if (updated.donor?.email) {
        await sendDeliveryStatusUpdateEmail(
          updated.donor.email,
          updated.donor.name,
          updated.foodName,
          status,
          volunteerName
        );
      }

      // Email NGO on status change
      if (updated.request?.ngo?.email) {
        await sendDeliveryStatusUpdateEmail(
          updated.request.ngo.email,
          updated.request.ngo.name,
          updated.foodName,
          status,
          volunteerName
        );
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update status' });
    }
  }
);

// Volunteer completes drop-off at NGO by entering / scanning NGO's Drop-off OTP
router.post(
  '/verify-dropoff/:donationId',
  authenticate,
  authorize([Role.VOLUNTEER]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.donationId);
      const volunteerId = req.user!.id;
      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({ error: 'Drop-off OTP is required' });
      }

      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
          volunteer: { select: { id: true, name: true, phone: true } },
          request: { include: { ngo: { select: { id: true, name: true, email: true, organization: true } } } },
        },
      });

      if (!donation || donation.volunteerId !== volunteerId) {
        return res.status(403).json({ error: 'Unauthorized or donation not assigned to you' });
      }

      if (donation.status !== 'OUT_FOR_DELIVERY' && donation.status !== 'PICKED_UP') {
        return res.status(400).json({
          error: `Cannot complete drop-off for food in '${donation.status}' state. Food must be in transit.`,
        });
      }

      // Check Drop-off OTP matching
      if (donation.dropoffOtp && donation.dropoffOtp.trim() !== String(otp).trim()) {
        return res.status(400).json({
          error: 'Invalid Drop-off OTP! Please ask the NGO shelter representative for their 4-digit handover verification code.',
        });
      }

      // Mark officially as DELIVERED
      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: DonationStatus.DELIVERED,
        },
        include: {
          donor: { select: { id: true, name: true, email: true, organization: true } },
          volunteer: { select: { id: true, name: true, phone: true } },
          request: { include: { ngo: { select: { id: true, name: true, email: true, organization: true } } } },
        },
      });

      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId },
        select: { name: true },
      });
      const volunteerName = volunteer?.name || 'Volunteer Courier';

      // Email notifications
      if (updated.donor?.email) {
        await sendDeliveryStatusUpdateEmail(
          updated.donor.email,
          updated.donor.name,
          updated.foodName,
          'DELIVERED (Handover Verified by Drop-off OTP)',
          volunteerName
        );
      }
      if (updated.request?.ngo?.email) {
        await sendDeliveryStatusUpdateEmail(
          updated.request.ngo.email,
          updated.request.ngo.name,
          updated.foodName,
          'DELIVERED (Handover Verified by Drop-off OTP)',
          volunteerName
        );
      }

      res.json({
        message: 'Drop-off OTP verified successfully! Mission marked as DELIVERED.',
        donation: updated,
      });
    } catch (error: any) {
      console.error('Verify drop-off OTP error:', error);
      res.status(500).json({ error: error?.message || 'Failed to verify drop-off OTP' });
    }
  }
);

export default router;
