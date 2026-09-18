import express from 'express';
import { 
    authUser, 
    registerUser, 
    logoutUser, 
    getUserProfile, 
    updateUserProfile,
    changePassword,
    getAllUsers 
} from '../controllers/userController.js';
import { protect, protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/auth/login', authUser);
router.post('/auth/register', registerUser);
router.post('/auth/logout', logoutUser);

// Protected routes (require user to be logged in)
router.route('/users/me')
    .get(protectUser, getUserProfile)
    .patch(protectUser, updateUserProfile);

router.post('/users/change-password', protectUser, changePassword);

// Admin routes
router.get('/users', protect, getAllUsers);

export default router;
