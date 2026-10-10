import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import { Admin } from '../models/Admin.js';

const seedAdmin = async (): Promise<void> => {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('[Admin Seed Error] INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be defined in .env');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      console.log(`[Admin Seed] Admin account (${normalizedEmail}) already exists. Setup is already complete. No modifications made.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the initial active admin
    const newAdmin = await Admin.create({
      email: normalizedEmail,
      passwordHash,
      name,
      isActive: true
    });

    console.log(`[Admin Seed] Successfully provisioned initial admin: ${newAdmin.email} (${newAdmin.name}).`);
    console.log('[Admin Seed] You can now log in through the admin panel. Remember to remove INITIAL_ADMIN_PASSWORD from your production environment.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error(`[Admin Seed Error] Failed to seed admin: ${err.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
