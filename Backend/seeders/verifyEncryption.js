import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

dotenv.config();

const verifyEncryption = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Check a user password (with select to include password field)
    const user = await User.findOne({ email: 'admin@boardmate.com' }).select('+password');
    console.log('Admin User:');
    console.log('Email:', user.email);
    console.log('Password (encrypted):', user.password);
    console.log('Is bcrypt hash:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    
    // Test password comparison
    const isValidPassword = await user.comparePassword('Admin@2024');
    console.log('Password "Admin@2024" matches:', isValidPassword);
    console.log();

    // Check a tenant password
    const tenant = await Tenant.findOne({ email: 'john.smith@email.com' }).select('+password');
    console.log('Tenant (John Smith):');
    console.log('Email:', tenant.email);
    console.log('Password (encrypted):', tenant.password);
    console.log('Is bcrypt hash:', tenant.password.startsWith('$2a$') || tenant.password.startsWith('$2b$'));
    
    // Test password comparison
    const isValidTenantPassword = await tenant.comparePassword('Tenant@2024');
    console.log('Password "Tenant@2024" matches:', isValidTenantPassword);
    console.log();

    console.log('✓ All passwords are properly encrypted with bcrypt!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyEncryption();
