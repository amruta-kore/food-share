import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../prisma/client';

export interface AuthRequest extends Request {
  user?: { id: number; role: Role };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'devsecret';

  try {
    const payload = jwt.verify(token, secret) as { id: number; role: Role };
    req.user = payload;
    next();
  } catch (err: any) {
    console.error('JWT authenticate error:', err?.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions for role ' + req.user.role });
    }
    next();
  };
};

/**
 * Middleware that checks if the authenticated user is admin-verified.
 * ADMIN accounts are always considered verified.
 */
export const requireVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }
  // Admins skip verification check
  if (req.user.role === Role.ADMIN) return next();

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { verified: true },
    });
    if (!dbUser) return res.status(404).json({ message: 'User not found' });
    if (!dbUser.verified) {
      return res.status(403).json({
        message: 'Account not yet verified by admin. Please wait for approval, or check your email for updates.',
        code: 'ACCOUNT_PENDING_VERIFICATION',
      });
    }
    next();
  } catch (err: any) {
    console.error('requireVerified error:', err?.message);
    return res.status(500).json({ message: 'Verification check failed' });
  }
};
