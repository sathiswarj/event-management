import express from 'express';
import { createRequest, getRequests, getRequestById, updateRequest, deleteRequest, getStats } from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(createRequest) // Public
    .get(getRequests); // Public (could be restricted in a real app, but requirements say public views are allowed)

// VERY IMPORTANT: /stats must come before /:id
router.route('/stats').get(protect, getStats);

router.route('/:id')
    .get(getRequestById) // Public
    .put(protect, updateRequest) // Admin Only
    .delete(protect, deleteRequest); // Admin Only

export default router;
