import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Request from '../models/Request.js';
import { extractStructuredFilters } from '../services/geminiService.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const message = 'send me the event details who booked on 25th sep';
        console.log(`Original Message: "${message}"`);
        
        const filters = await extractStructuredFilters(message);
        console.log('Extracted filters:', filters);

        let hasStructuredFilters = false;
        const matchQuery = {};

        if (filters.date) {
            const dateStr = filters.date;
            matchQuery.eventDate = {
                $gte: new Date(`${dateStr}T00:00:00.000Z`),
                $lte: new Date(`${dateStr}T23:59:59.999Z`)
            };
            hasStructuredFilters = true;
        } else if (filters.dateRange) {
            matchQuery.eventDate = {
                $gte: new Date(`${filters.dateRange.start}T00:00:00.000Z`),
                $lte: new Date(`${filters.dateRange.end}T23:59:59.999Z`)
            };
            hasStructuredFilters = true;
        }
        
        console.log('Match Query:', matchQuery);

        if (hasStructuredFilters) {
            let exactMatches = await Request.find(matchQuery).populate('category', 'name').populate('user', 'name email');
            console.log(`Found ${exactMatches.length} exact matches`);
            if (exactMatches.length > 0) {
                console.log(exactMatches.map(m => m.requestId));
            }
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
