import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from '../models/Request.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const req = await Request.findOne({ requestId: '0be8a344-2db8-4168-b8b2-a88b320c3962' }).populate('user', 'name email');
        
        console.log('Original req.user:', req.user);
        
        const doc = req.toObject();
        console.log('doc.user:', doc.user);
        console.log('formatted:', {
            customerName: doc.user ? doc.user.name : null
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
