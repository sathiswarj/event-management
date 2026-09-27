import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Assuming @google/genai is initialized this way, wait let me check the package usage
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extract structured filters and semantic intent from a natural language question
 * @param {string} question 
 * @returns {Promise<Object>}
 */
export const extractStructuredFilters = async (question) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const currentYear = new Date().getFullYear();
        const prompt = `You are a query parser for an event request database.
Today's date is ${currentDate} (Year ${currentYear}).
Extract structured filters from this question: "${question}"

Return ONLY valid JSON in this exact shape without markdown fences:
{
  "date": "YYYY-MM-DD" or null,
  "dateRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" } or null,
  "status": "Pending" | "Approved" | "Rejected" | "Confirmed" | "Date Conflict" or null,
  "category": string or null,
  "semanticQuery": string or null (only set if the question is fuzzy/conceptual and doesn't map to exact fields above)
}`;

        let retries = 5;
        let response;
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-3.7-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
                break;
            } catch (err) {
                if (err.status === 503 && retries > 1) {
                    console.log('503 Unavailable in extraction, retrying...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    retries--;
                } else {
                    throw err;
                }
            }
        }

        const rawText = response.text.trim();
        const jsonStr = rawText.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error extracting filters:', error);
        return { date: null, dateRange: null, status: null, category: null, semanticQuery: question };
    }
};

/**
 * Generate embedding for text
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
        });
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

/**
 * Generate chat completion with RAG context
 * @param {string} question Admin's question
 * @param {Array} contextRequests Array of request documents retrieved from DB
 * @returns {Promise<string>}
 */
export const generateRAGAnswer = async (question, contextRequests) => {
    try {
        const contextStr = JSON.stringify(contextRequests, null, 2);

        const prompt = contextRequests.length === 0
            ? `You are an assistant helping an admin review event requests. The admin asked: "${question}".
There were no matching requests found in the database. Respond naturally telling the admin that no matching requests were found for their query.`
            : `You are helping an admin review event requests. Based on this data:
${contextStr}

Answer the admin's question clearly and specifically, mentioning requestId, customer name, date, and status where relevant: ${question}`;

        let retries = 5;
        let response;
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-3.7-flash',
                    contents: prompt,
                });
                break; // Success
            } catch (err) {
                if (err.status === 503 && retries > 1) {
                    console.log('503 Unavailable in RAG answer, retrying...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    retries--;
                } else {
                    throw err;
                }
            }
        }

        return response.text;
    } catch (error) {
        console.error('Error generating RAG answer:', error);
        throw error;
    }
};
