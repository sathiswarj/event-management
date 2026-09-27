import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await mongoose.connection.db.collection('requests').updateOne(
            { requestId: '0be8a344-2db8-4168-b8b2-a88b320c3962' },
            { $set: { userId: 'fd80311f-97b8-4f37-bbe1-61b7106e4f50', categoryId: '2cda7a1f-d32d-47c8-8e73-9741e160c334' } }
        );
        console.log('Database updated!', result);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
