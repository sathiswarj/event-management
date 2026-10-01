import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_events';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@eleganceevents.com';
        const existing = await Admin.findOne({ email });

        if (existing) {
            console.log(`Admin already exists with email: ${email}`);
            console.log('Updating password to admin123...');
            existing.password = 'admin123';
            await existing.save();
            console.log('Password updated successfully!');
        } else {
            const admin = await Admin.create({
                name: 'Super Admin',
                email,
                phone: '9999999999',
                password: 'admin123',
            });
            console.log(`Admin created: ${admin.email} (adminId: ${admin.adminId})`);
        }

        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
