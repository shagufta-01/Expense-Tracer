import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { localDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'madar_al_tasis_super_secret_jwt_key_2026_makkah';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  phone?: string;
  language?: string;
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: any): string {
  const payload: AuthenticatedUser = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    language: user.language,
    avatar: user.avatar,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    const store = localDb.getStore();
    const user = store.users.find((u) => (u._id || u.id) === decoded.id);

    if (user && user.isActive !== false) {
      req.user = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        language: user.language,
        avatar: user.avatar,
      };
    }
  } catch (err) {
    // Invalid token, leave req.user undefined
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireOwner(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied: Owner privileges required.' });
  }
  next();
}
