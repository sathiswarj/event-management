import express from 'express';
import { createRequest, getRequests, getRequestById, updateRequest, deleteRequest, getStats, getMyRequests, acceptRequest, rejectRequest } from '../controllers/requestController.js';
import { protect, protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protectUser, createRequest) // User Only (modified to require user)
    .get(getRequests); // Public (could be restricted in a real app, but requirements say public views are allowed)

// VERY IMPORTANT: /stats and /my must come before /:id
router.route('/stats').get(protect, getStats);
router.route('/my').get(protectUser, getMyRequests);

router.route('/:id')
    .get(protectUser, getRequestById) // User Only
    .put(protect, updateRequest) // Admin Only
    .delete(protect, deleteRequest); // Admin Only

router.post('/:id/accept', protectUser, acceptRequest);
router.post('/:id/reject', protectUser, rejectRequest);

export default router;
