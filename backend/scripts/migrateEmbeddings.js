import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from '../models/Request.js';
import { generateEmbedding } from '../services/geminiService.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const requests = await Request.find({ 
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ] 
        });

        console.log(`Found ${requests.length} requests needing embeddings.`);

        for (const req of requests) {
            try {
                const textToEmbed = `Title: ${req.title}. Description: ${req.description}. Category ID: ${req.categoryId}. Date: ${req.eventDate}`;
                const embedding = await generateEmbedding(textToEmbed);
                
                req.embedding = embedding;
                await req.save();
                
                console.log(`Updated request: ${req.requestId}`);
                
                // Add a small delay to avoid hitting rate limits on Gemini API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Error updating request ${req.requestId}:`, err.message);
            }
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
