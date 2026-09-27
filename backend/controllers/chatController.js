import ChatSession from '../models/ChatSession.js';
import Request from '../models/Request.js';
import Category from '../models/Category.js';
import { generateEmbedding, generateRAGAnswer, extractStructuredFilters } from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

// Helper for local dev when Atlas Vector Search isn't available
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// @desc    Handle chat messages
// @route   POST /api/admin/chat
// @access  Private/Admin
export const handleChatMessage = async (req, res, next) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Handle Session
        let session;
        const currentSessionId = sessionId || uuidv4();
        
        session = await ChatSession.findOne({ sessionId: currentSessionId });
        if (!session) {
            session = new ChatSession({ sessionId: currentSessionId, messages: [] });
        }

        // Add user message to session
        session.messages.push({ role: 'user', content: message });
        
        // 1. Extract Structured Filters
        const filters = await extractStructuredFilters(message);
        console.log('Extracted filters:', filters);

        let retrievedRequests = [];
        let exactMatches = [];
        let hasStructuredFilters = false;

        // Build exact query if structured filters are present
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

        if (filters.status) {
            matchQuery.status = filters.status;
            hasStructuredFilters = true;
        }

        if (filters.category) {
            const cat = await Category.findOne({ name: { $regex: new RegExp(filters.category, 'i') } });
            if (cat) {
                matchQuery.categoryId = cat.categoryId || cat._id.toString();
                hasStructuredFilters = true;
            }
        }

        if (hasStructuredFilters) {
            // Find exact matches first
            let queryObj = Request.find(matchQuery).populate('category', 'name').populate('user', 'name email');
            exactMatches = await queryObj;
        }

        // 2. Perform Vector Search (if semanticQuery is present or no structured filters matched)
        if (filters.semanticQuery) {
            const queryEmbedding = await generateEmbedding(filters.semanticQuery);
            let semanticMatches = [];
            
            try {
                const pipeline = [
                    {
                        $vectorSearch: {
                            index: "vector_index",
                            path: "embedding",
                            queryVector: queryEmbedding,
                            numCandidates: 100,
                            limit: 5
                        }
                    },
                    {
                        $project: {
                            embedding: 0,
                            _id: 0,
                            __v: 0
                        }
                    }
                ];
                semanticMatches = await Request.aggregate(pipeline);
            } catch (dbError) {
                console.log('Atlas Vector Search failed, falling back to in-memory cosine similarity.');
                // Fallback for local development
                const allRequests = hasStructuredFilters ? exactMatches : await Request.find({ embedding: { $exists: true, $type: 'array', $ne: [] } }).populate('category', 'name').populate('user', 'name email').select('+embedding');
                
                const requestsWithScore = allRequests.map(req => {
                    const score = cosineSimilarity(queryEmbedding, req.embedding);
                    return { req, score };
                });

                requestsWithScore.sort((a, b) => b.score - a.score);
                semanticMatches = requestsWithScore.slice(0, 5).map(item => {
                    const doc = item.req.toObject ? item.req.toObject() : item.req;
                    delete doc.embedding;
                    delete doc._id;
                    delete doc.__v;
                    return doc;
                });
            }
            
            if (hasStructuredFilters) {
                // If we have both, we intersect or just rank the exact matches by semantic score.
                // In local fallback, we already did this above. If Atlas Vector search worked, 
                // we would need to intersect semanticMatches and exactMatches. 
                // For simplicity, we just use the semanticMatches but filter them to only include those in exactMatches.
                const exactIds = new Set(exactMatches.map(r => r.requestId));
                retrievedRequests = semanticMatches.filter(r => exactIds.has(r.requestId));
            } else {
                retrievedRequests = semanticMatches;
            }
        } else {
            // No semantic query, just use exact matches
            retrievedRequests = exactMatches.slice(0, 10).map(r => {
                const doc = r.toObject ? r.toObject() : r;
                delete doc.embedding;
                delete doc._id;
                delete doc.__v;
                return doc;
            });
        }
        
        // Ensure category and customerName are formatted nicely for Gemini
        // if they are populated objects
        const formattedRequests = retrievedRequests.map(req => ({
            ...req,
            customerName: req.user ? req.user.name : 'Unknown (No User Assigned)',
            categoryName: req.category ? req.category.name : 'Unknown'
        }));

        // 3. Generate answer using RAG context
        const answer = await generateRAGAnswer(message, formattedRequests);

        // 4. Add assistant message to session
        session.messages.push({ role: 'assistant', content: answer });
        await session.save();

        res.status(200).json({
            sessionId: currentSessionId,
            answer,
            matchedRequestIds: formattedRequests.map(r => r.requestId)
        });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get chat session history
// @route   GET /api/admin/chat/:sessionId
// @access  Private/Admin
export const getChatSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const session = await ChatSession.findOne({ sessionId });
        
        if (!session) {
            return res.status(200).json({ sessionId, messages: [] });
        }
        
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
