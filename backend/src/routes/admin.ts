import { Router, Response, Request } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import { prisma } from '../prisma/client';
import {
  sendAccountVerifiedEmail,
  sendMail,
} from '../utils/mailer';

const router = Router();

// Stats summary for admin dashboard – ADMIN ONLY
router.get('/stats', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDonations = await prisma.donation.count();
    const completedDonations = await prisma.donation.count({ where: { status: 'COMPLETED' } });
    const availableDonations = await prisma.donation.count({ where: { status: 'AVAILABLE' } });
    const totalRequests = await prisma.request.count();

    const donorsCount = await prisma.user.count({ where: { role: Role.DONOR } });
    const ngosCount = await prisma.user.count({ where: { role: Role.NGO } });
    const volunteersCount = await prisma.user.count({ where: { role: Role.VOLUNTEER } });

    const pendingVerifications = await prisma.user.count({ where: { verified: false, role: { not: Role.ADMIN } } });

    const totalServingsAgg = await prisma.donation.aggregate({
      _sum: { servings: true, quantity: true },
    });

    res.json({
      totalUsers,
      totalDonations,
      completedDonations,
      availableDonations,
      totalRequests,
      donorsCount,
      ngosCount,
      volunteersCount,
      pendingVerifications,
      totalServingsSaved: totalServingsAgg._sum.servings || 0,
      totalKgSaved: totalServingsAgg._sum.quantity || 0,
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// List all users (admin only) with full verification details
router.get('/users', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const { verified } = req.query;
    const where: any = {};
    if (verified === 'true') where.verified = true;
    if (verified === 'false') where.verified = false;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        organization: true,
        phone: true,
        documentUrl: true,
        documentType: true,
        documentName: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Verify handler – sends approval email
const handleVerify = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
      select: { id: true, name: true, email: true, role: true, verified: true },
    });

    // Send approval email
    await sendAccountVerifiedEmail(updated.email, updated.name, updated.role);

    res.json(updated);
  } catch (error: any) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

// Accept both POST and PATCH
router.post('/users/:id/verify', authenticate, authorize([Role.ADMIN]), handleVerify);
router.patch('/users/:id/verify', authenticate, authorize([Role.ADMIN]), handleVerify);

// Reject / unverify handler with reason – sends rejection email
const handleReject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { reason } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        verified: false,
        verifiedAt: null,
        rejectionReason: reason || 'Document could not be verified. Please re-submit with valid documents.',
      },
      select: { id: true, name: true, email: true, role: true, verified: true, rejectionReason: true },
    });

    // Send rejection email
    await sendMail({
      to: updated.email,
      subject: `❌ FoodShare Verification Update for your ${updated.role} account`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #dc2626; margin-top: 0;">Verification Not Approved</h2>
          <p>Dear ${updated.name},</p>
          <p>Unfortunately, your <strong>${updated.role}</strong> account verification on FoodShare was not approved at this time.</p>
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">Reason:</p>
            <p style="margin: 4px 0 0; color: #7f1d1d;">${updated.rejectionReason}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">Please re-register with valid legal documentation, or contact support if you believe this is an error.</p>
        </div>
      `,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};

// Accept both POST and PATCH
router.post('/users/:id/reject', authenticate, authorize([Role.ADMIN]), handleReject);
router.patch('/users/:id/reject', authenticate, authorize([Role.ADMIN]), handleReject);

// List all donations (admin overview)
router.get('/donations', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        donor: { select: { id: true, name: true, organization: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
        request: { include: { ngo: { select: { id: true, name: true, organization: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(donations);
  } catch (error: any) {
    console.error('Fetch all donations error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// List all requests (admin overview)
router.get('/requests', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        donation: true,
        ngo: { select: { id: true, name: true, organization: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error: any) {
    console.error('Fetch all requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

export default router;
