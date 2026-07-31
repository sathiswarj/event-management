import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/auth/login
// @access  Public
export const authAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            generateToken(res, admin._id);
            res.status(200).json({
                _id: admin._id,
                email: admin.email,
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new admin (Setup purpose only, maybe remove in prod)
// @route   POST /api/admin/auth/register
// @access  Public
export const registerAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            res.status(400);
            throw new Error('Admin already exists');
        }

        const admin = await Admin.create({ email, password });
        if (admin) {
            generateToken(res, admin._id);
            res.status(201).json({ _id: admin._id, email: admin.email });
        } else {
            res.status(400);
            throw new Error('Invalid admin data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/auth/logout
// @access  Private
export const logoutAdmin = async (req, res, next) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ message: 'Admin logged out' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/auth/profile
// @access  Private
export const getAdminProfile = async (req, res, next) => {
    try {
        const admin = {
            _id: req.admin._id,
            email: req.admin.email,
        };
        res.status(200).json(admin);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all admins
// @route   GET /api/admin/auth/users
// @access  Private
export const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find({}).select('-password').sort('createdAt');
        res.status(200).json(admins);
    } catch (error) {
        next(error);
    }
};
