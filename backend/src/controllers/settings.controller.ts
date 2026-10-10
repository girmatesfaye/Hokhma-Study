import { Request, Response } from 'express';
import { SiteSettings } from '../models/SiteSettings.js';

// Default fallback profile for initial instantiation
const DEFAULT_PROFILE = {
  name: 'Dr. Girma Tesfaye',
  role: 'Theological Scholar & Apologist',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  bio: 'Dedicated to rigorous Christian intellectual inquiry and philosophical apologetics.',
  email: 'girma@hokhmastudy.org',
  tagline: 'Defending Truth, Equipping the Church',
  mission: 'To bring intellectual depth, historical fidelity, and biblical clarity to contemporary Ethiopian theological discussions.'
};

// Retrieve public author profile and statement of faith (singleton)
export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SiteSettings.findOne({ singletonKey: 'site_settings' });

    // Auto-initialize default singleton document if not yet created
    if (!settings) {
      settings = await SiteSettings.create({
        singletonKey: 'site_settings',
        profile: DEFAULT_PROFILE,
        faithStatements: []
      });
    }

    res.status(200).json({
      profile: settings.profile,
      faithStatements: settings.faithStatements
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to retrieve site settings.', error: err.message });
  }
};

// Update author profile information (admin authenticated)
export const updateAuthorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profileData = req.body;

    const settings = await SiteSettings.findOneAndUpdate(
      { singletonKey: 'site_settings' },
      { $set: { profile: profileData } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: 'Author profile updated successfully.', profile: settings.profile });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update author profile.', error: err.message });
  }
};

// Update statement of faith doctrines (admin authenticated)
export const updateFaithStatements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faithStatements } = req.body;

    if (!Array.isArray(faithStatements)) {
      res.status(400).json({ message: 'faithStatements must be an array.' });
      return;
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { singletonKey: 'site_settings' },
      { $set: { faithStatements } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Faith statements updated successfully.',
      faithStatements: settings.faithStatements
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Failed to update faith statements.', error: err.message });
  }
};
