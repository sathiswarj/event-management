import express from 'express';
import { handleChatMessage, getChatSession } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, handleChatMessage);
router.get('/:sessionId', protect, getChatSession);

export default router;
