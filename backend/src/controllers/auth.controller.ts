import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Look up admin by normalized email
    const admin = await Admin.findOne({ email: normalizedEmail });

    // Use constant-time comparison defense or generic failure message
    if (!admin || !admin.isActive) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(String(password), admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth Error] JWT_SECRET is not configured.');
      res.status(500).json({ message: 'Internal server configuration error.' });
      return;
    }

    // Sign 24-hour JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email
      },
      secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error(`[Auth Error] Login failure: ${err.message}`);
    res.status(500).json({ message: 'An unexpected error occurred during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({ message: 'Not authenticated.' });
    return;
  }

  res.status(200).json({
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name
    }
  });
};
