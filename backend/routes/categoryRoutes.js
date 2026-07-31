import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getCategories) // Public
    .post(protect, createCategory); // Admin Only

router.route('/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

export default router;
