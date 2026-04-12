import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Settings from './models/Settings.js';

/**
 * Seed script: creates admin user and default settings.
 * Run with: node seed.js
 */
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
    } else {
      const admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@motolease.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        phone: '+1000000000',
        role: 'admin',
        isActive: true,
      });
      console.log('Admin user created:', admin.email);
    }

    // Create default settings if not existing
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({
        commissionPercent: 10,
        maintenanceMode: false,
      });
      console.log('Default settings created.');
    } else {
      console.log('Settings already exist.');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seed();
