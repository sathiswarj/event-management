import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from './models/Request.js'; // Ensure this path matches your structure

dotenv.config();

const debugConflicts = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully.\n');

        const requests = await Request.find({}).sort({ eventDate: 1 });
        
        console.log(`Found ${requests.length} requests in the database.\n`);
        console.log('--- Request Dump ---');
        
        requests.forEach((req, index) => {
            const rawDate = req.eventDate;
            const isoString = rawDate instanceof Date ? rawDate.toISOString() : String(rawDate);
            
            console.log(`[${index + 1}] Request ID : ${req.requestId || req._id}`);
            console.log(`    Status     : "${req.status}"`);
            console.log(`    Conflict?  : ${req.dateConflict}`);
            console.log(`    Raw Date   : ${rawDate}`);
            console.log(`    ISO Date   : ${isoString}`);
            console.log('--------------------------------------------------');
        });

        mongoose.connection.close();
        console.log('\nDebug complete. Disconnected from MongoDB.');
    } catch (error) {
        console.error('Error during debugging:', error);
        process.exit(1);
    }
};

debugConflicts();
