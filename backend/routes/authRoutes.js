import express from 'express';
import { authAdmin, registerAdmin, logoutAdmin, getAdminProfile, getAllAdmins, changePassword, updateAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/register', protect, registerAdmin); // Protect register route
router.post('/logout', logoutAdmin);
router.get('/profile', protect, getAdminProfile);
router.get('/users', protect, getAllAdmins);
router.put('/users/:id', protect, updateAdmin);
router.put('/change-password', protect, changePassword);

export default router;
