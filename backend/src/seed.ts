import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/user.model';
import { Lead } from './models/lead.model';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-leads';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding');

    // Clean current databases
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing users and leads');

    // Create Admin User
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('password123', adminSalt);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@gigflow.com',
      password: adminPassword,
      role: 'Admin'
    });
    await adminUser.save();

    // Create Sales Rep
    const salesSalt = await bcrypt.genSalt(10);
    const salesPassword = await bcrypt.hash('password123', salesSalt);
    const salesUser = new User({
      name: 'Sales Rep',
      email: 'sales@gigflow.com',
      password: salesPassword,
      role: 'Sales User'
    });
    await salesUser.save();

    console.log('Seeded base users: admin@gigflow.com and sales@gigflow.com (password: password123)');

    // Create Sample Leads
    const sampleLeads = [
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        status: 'Qualified',
        source: 'Instagram',
        createdBy: salesUser._id
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        status: 'New',
        source: 'Website',
        createdBy: salesUser._id
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        status: 'Contacted',
        source: 'Referral',
        createdBy: adminUser._id
      },
      {
        name: 'Neha Singh',
        email: 'neha@example.com',
        status: 'Lost',
        source: 'Instagram',
        createdBy: salesUser._id
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan@example.com',
        status: 'Qualified',
        source: 'Website',
        createdBy: salesUser._id
      },
      {
        name: 'Sneha Roy',
        email: 'sneha@example.com',
        status: 'New',
        source: 'Instagram',
        createdBy: adminUser._id
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        status: 'Contacted',
        source: 'Website',
        createdBy: salesUser._id
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun@example.com',
        status: 'Qualified',
        source: 'Referral',
        createdBy: salesUser._id
      },
      {
        name: 'Anjali Desai',
        email: 'anjali@example.com',
        status: 'New',
        source: 'Website',
        createdBy: salesUser._id
      },
      {
        name: 'Karan Malhotra',
        email: 'karan@example.com',
        status: 'Contacted',
        source: 'Instagram',
        createdBy: adminUser._id
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        status: 'Qualified',
        source: 'Referral',
        createdBy: salesUser._id
      },
      {
        name: 'Simran Kaur',
        email: 'simran@example.com',
        status: 'Lost',
        source: 'Website',
        createdBy: salesUser._id
      }
    ];

    await Lead.insertMany(sampleLeads);
    console.log(`Seeded ${sampleLeads.length} sample leads`);

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
