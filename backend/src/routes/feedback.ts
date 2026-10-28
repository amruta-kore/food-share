import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Helper to extract user if token is provided (optional auth for guest/registered users)
const getOptionalUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'devsecret';
  try {
    const payload = jwt.verify(token, secret) as { id: number; role: Role };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, organization: true },
    });
    return user;
  } catch {
    return null;
  }
};

/**
 * POST /api/feedback
 * Submit feedback and rating - Open to ANY TYPE OF USER
 * (Donor, NGO, Volunteer, Admin, or General Public / Visitor)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { rating, feedback, category, userType, name, email, isPublic } = req.body;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide meaningful feedback (minimum 3 characters).' });
    }

    // Check if user is authenticated
    const authUser = await getOptionalUser(req);

    const resolvedUserId = authUser ? authUser.id : null;
    const resolvedName = (name && name.trim()) || (authUser ? authUser.name : 'Community Member');
    const resolvedEmail = (email && email.trim()) || (authUser ? authUser.email : null);
    
    // Resolve userType: If logged in, prioritize user role (or organization), else user-specified or "VISITOR"
    let resolvedUserType = 'VISITOR';
    if (authUser) {
      resolvedUserType = authUser.role; // DONOR, NGO, VOLUNTEER, ADMIN
    } else if (userType && typeof userType === 'string' && userType.trim()) {
      resolvedUserType = userType.trim().toUpperCase();
    }

    const validCategories = [
      'Website & Usability',
      'Food Redistribution Flow',
      'Donation & Listing',
      'NGO Food Claiming',
      'Volunteer Delivery',
      'Platform Reliability',
      'General Suggestion',
      'Bug Report',
    ];

    const resolvedCategory = validCategories.includes(category)
      ? category
      : 'Website & Usability';

    const newFeedback = await prisma.feedback.create({
      data: {
        rating: Math.round(parsedRating),
        feedback: feedback.trim(),
        category: resolvedCategory,
        userType: resolvedUserType,
        name: resolvedName,
        email: resolvedEmail,
        userId: resolvedUserId,
        isPublic: isPublic !== false,
        status: 'APPROVED',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback and rating have been submitted successfully.',
      feedback: newFeedback,
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

/**
 * GET /api/feedback
 * Retrieve approved public feedback & rating metrics for the community / home page
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userType, category, rating, limit } = req.query;

    const where: any = {
      status: 'APPROVED',
      isPublic: true,
    };

    if (userType && userType !== 'ALL') {
      where.userType = String(userType).toUpperCase();
    }

    if (category && category !== 'ALL') {
      where.category = String(category);
    }

    if (rating && !isNaN(Number(rating))) {
      where.rating = Number(rating);
    }

    const takeLimit = Math.min(Number(limit) || 20, 100);

    const [feedbacks, totalCount, allRatings] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: takeLimit,
        select: {
          id: true,
          rating: true,
          feedback: true,
          category: true,
          userType: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              role: true,
              organization: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where: { status: 'APPROVED', isPublic: true } }),
      prisma.feedback.groupBy({
        by: ['rating'],
        where: { status: 'APPROVED', isPublic: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate rating distribution and average
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRatings = 0;
    let totalRatingsCount = 0;

    allRatings.forEach((group) => {
      distribution[group.rating] = group._count.rating;
      sumRatings += group.rating * group._count.rating;
      totalRatingsCount += group._count.rating;
    });

    const averageRating = totalRatingsCount > 0
      ? Number((sumRatings / totalRatingsCount).toFixed(1))
      : 5.0;

    res.json({
      reviews: feedbacks,
      totalCount,
      averageRating,
      ratingDistribution: distribution,
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback.' });
  }
});

/**
 * GET /api/feedback/admin
 * Admin endpoint to view all feedback (including hidden) with filtering
 */
router.get('/admin', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            organization: true,
          },
        },
      },
    });

    const totalCount = feedbacks.length;
    const averageRating = totalCount > 0
      ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1))
      : 0;

    res.json({
      feedbacks,
      totalCount,
      averageRating,
    });
  } catch (error: any) {
    console.error('Error fetching admin feedback:', error);
    res.status(500).json({ error: 'Failed to fetch admin feedback records.' });
  }
});

/**
 * DELETE /api/feedback/admin/:id
 * Admin endpoint to delete feedback
 */
router.delete('/admin/:id', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    await prisma.feedback.delete({ where: { id: feedbackId } });
    res.json({ success: true, message: 'Feedback entry removed.' });
  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback entry.' });
  }
});

/**
 * PATCH /api/feedback/admin/:id/status
 * Admin endpoint to toggle or change feedback status ('APPROVED' | 'HIDDEN')
 */
router.patch('/admin/:id/status', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    const { status } = req.body;

    if (!['APPROVED', 'HIDDEN'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or HIDDEN.' });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status },
    });

    res.json({ success: true, feedback: updated });
  } catch (error: any) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status.' });
  }
});

export default router;
