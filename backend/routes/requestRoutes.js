import express from 'express';
import { createRequest, getRequests, getRequestById, updateRequest, deleteRequest, getStats, getMyRequests, acceptRequest, rejectRequest, negotiateRequest, adminReplyRequest, sendQuotation } from '../controllers/requestController.js';
import { protect, protectUser } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads dir exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.route('/')
    .post(protectUser, createRequest) // User Only
    .get(getRequests); // Public

// VERY IMPORTANT: /stats and /my must come before /:id
router.route('/stats').get(protect, getStats);
router.route('/my').get(protectUser, getMyRequests);

router.route('/:id')
    .get(getRequestById) // Public (Allows both user & admin portals)
    .put(protect, updateRequest) // Admin Only
    .delete(protect, deleteRequest); // Admin Only

router.post('/:id/accept', protectUser, acceptRequest);
router.post('/:id/reject', protectUser, rejectRequest);
router.post('/:id/negotiate', protectUser, negotiateRequest);
router.post('/:id/admin-reply', protect, adminReplyRequest);
router.post('/:id/send-quotation', protect, upload.single('quotation'), sendQuotation);

export default router;
