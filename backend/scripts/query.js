import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const requests = await db.collection('requests').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'user'
                }
            }
        ]).toArray();
        
        const sep29 = requests.filter(r => r.eventDate && r.eventDate.toISOString().includes('09-29'));
        console.log(JSON.stringify(sep29, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
