import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin } from '../models/Admin.js';

export interface AuthRequest extends Request {
  admin?: IAdmin;
}

interface JwtPayload {
  id: string;
  email: string;
}

// Resolves the admin from a Bearer token and returns null when the token is missing or invalid.
const resolveAdmin = async (authHeader?: string): Promise<IAdmin | null> => {
  const secret = process.env.JWT_SECRET;
  if (!authHeader || !authHeader.startsWith('Bearer ') || !secret) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], secret) as JwtPayload;
    const admin = decoded?.id ? await Admin.findById(decoded.id) : null;
    return admin && admin.isActive ? admin : null;
  } catch {
    return null;
  }
};

// Never rejects: sets req.admin when a valid token is present so public routes can serve admin-only data.
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const admin = await resolveAdmin(req.headers.authorization);
  if (admin) req.admin = admin;
  next();
};

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Access denied. Malformed token.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth Error] JWT_SECRET is not configured.');
      res.status(500).json({ message: 'Internal server configuration error.' });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || !decoded.id) {
      res.status(401).json({ message: 'Access denied. Invalid token payload.' });
      return;
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      res.status(401).json({ message: 'Access denied. Account is inactive or deleted.' });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Access denied. Token has expired.' });
      return;
    }
    res.status(401).json({ message: 'Access denied. Invalid token.' });
  }
};
