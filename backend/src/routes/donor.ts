import { Router, Response } from 'express';
import { authenticate, authorize, requireVerified, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import { prisma } from '../prisma/client';
import {
  sendClaimAcceptedEmailToNGO,
  sendNewMissionBroadcastEmailToVolunteers,
  sendMail,
} from '../utils/mailer';

const router = Router();

// Get donations created by the logged-in donor (must be verified)
router.get(
  '/my-donations',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const donations = await prisma.donation.findMany({
        where: { donorId: userId },
        include: {
          request: {
            include: {
              ngo: { select: { id: true, name: true, organization: true, email: true, phone: true } },
            },
          },
          volunteer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(donations);
    } catch (error: any) {
      console.error('Fetch donor donations error:', error);
      res.status(500).json({ error: 'Failed to fetch donations' });
    }
  }
);

// Accept a request for a donation (verified donor only)
router.post(
  '/accept-request/:requestId',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const requestId = Number(req.params.requestId);
      const userId = req.user!.id;

      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: {
          donation: {
            include: {
              donor: { select: { id: true, name: true, email: true, organization: true } },
            },
          },
          ngo: { select: { id: true, name: true, email: true, organization: true, phone: true } },
        },
      });

      if (!request || request.donation.donorId !== userId) {
        return res.status(403).json({ error: 'Unauthorized or request not found' });
      }

      await prisma.request.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      const updatedDonation = await prisma.donation.update({
        where: { id: request.donationId },
        data: { status: 'ACCEPTED' },
        include: { request: { include: { ngo: true } } },
      });

      // Email NGO: claim accepted
      if (request.ngo?.email) {
        await sendClaimAcceptedEmailToNGO(
          request.ngo.email,
          request.ngo.name,
          request.donation.donor.name,
          request.donation.donor.organization || request.donation.donor.name,
          request.donation.foodName,
          request.donation.pickupAddress
        );
      }

      // Broadcast to all verified volunteers about the new delivery mission
      const volunteers = await prisma.user.findMany({
        where: { role: Role.VOLUNTEER, verified: true },
        select: { email: true },
      });
      const volunteerEmails = volunteers.map((v) => v.email);
      await sendNewMissionBroadcastEmailToVolunteers(
        volunteerEmails,
        request.donation.foodName,
        request.donation.donor.organization || request.donation.donor.name,
        request.ngo?.organization || request.ngo?.name || 'Partner NGO',
        request.donation.city
      );

      res.json({ message: 'Request accepted successfully', donation: updatedDonation });
    } catch (error: any) {
      console.error('Accept request error:', error);
      res.status(500).json({ error: 'Failed to accept request' });
    }
  }
);

// Reject a request for a donation (verified donor only)
router.post(
  '/reject-request/:requestId',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const requestId = Number(req.params.requestId);
      const userId = req.user!.id;

      const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { donation: true, ngo: { select: { id: true, name: true, email: true } } },
      });

      if (!request || request.donation.donorId !== userId) {
        return res.status(403).json({ error: 'Unauthorized or request not found' });
      }

      await prisma.request.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
      await prisma.donation.update({ where: { id: request.donationId }, data: { status: 'AVAILABLE' } });

      // Notify NGO that request was declined
      if (request.ngo?.email) {
        await sendMail({
          to: request.ngo.email,
          subject: `❌ Food Claim Declined for ${request.donation.foodName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #dc2626; margin-top: 0;">Food Request Declined</h2>
              <p>Dear ${request.ngo.name},</p>
              <p>The donor has declined your request for <strong>${request.donation.foodName}</strong>. The food is now available again for other NGOs.</p>
              <a href="http://localhost:3000/ngo" style="display:inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Browse Other Donations</a>
            </div>
          `,
        });
      }

      res.json({ message: 'Request rejected, food is available again' });
    } catch (error: any) {
      console.error('Reject request error:', error);
      res.status(500).json({ error: 'Failed to reject request' });
    }
  }
);

// Secure Handover: Donor enters / scans volunteer's 4-digit Pickup OTP
router.post(
  '/verify-pickup/:donationId',
  authenticate,
  authorize([Role.DONOR]),
  requireVerified,
  async (req: AuthRequest, res: Response) => {
    try {
      const donationId = Number(req.params.donationId);
      const donorId = req.user!.id;
      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({ error: 'Pickup OTP is required' });
      }

      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
        include: {
          donor: { select: { id: true, name: true, organization: true } },
          volunteer: { select: { id: true, name: true, phone: true } },
          request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
        },
      });

      if (!donation || donation.donorId !== donorId) {
        return res.status(403).json({ error: 'Unauthorized or donation not found' });
      }

      if (donation.status !== 'VOLUNTEER_ASSIGNED') {
        return res.status(400).json({
          error: `Cannot verify pickup for food in '${donation.status}' state. Food must be in 'VOLUNTEER_ASSIGNED' status.`,
        });
      }

      // Check OTP matching (trim and compare)
      if (donation.pickupOtp && donation.pickupOtp.trim() !== String(otp).trim()) {
        return res.status(400).json({
          error: 'Invalid Pickup OTP! Please ensure you verify the exact 4-digit code shown by the volunteer.',
        });
      }

      // Transition donation to PICKED_UP
      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'PICKED_UP',
        },
        include: {
          donor: { select: { id: true, name: true, organization: true } },
          volunteer: { select: { id: true, name: true, phone: true } },
          request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
        },
      });

      res.json({
        message: 'Pickup OTP successfully verified! Food safely handed over to courier.',
        donation: updated,
      });
    } catch (error: any) {
      console.error('Verify pickup OTP error:', error);
      res.status(500).json({ error: error?.message || 'Failed to verify pickup OTP' });
    }
  }
);

export default router;
