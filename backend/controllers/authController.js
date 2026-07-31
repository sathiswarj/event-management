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

// @desc    Register a new admin
// @route   POST /api/admin/auth/register
// @access  Private
export const registerAdmin = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            res.status(400);
            throw new Error('Admin already exists');
        }

        const admin = await Admin.create({ name, email, phone, password });
        if (admin) {
            res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone });
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
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
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

// @desc    Change Password
// @route   PUT /api/admin/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.admin._id);

        if (admin && (await admin.matchPassword(currentPassword))) {
            admin.password = newPassword;
            await admin.save();
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(401);
            throw new Error('Incorrect current password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update admin profile details
// @route   PUT /api/admin/auth/users/:id
// @access  Private
export const updateAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (admin) {
            admin.name = req.body.name !== undefined ? req.body.name : admin.name;
            admin.email = req.body.email !== undefined ? req.body.email : admin.email;
            admin.phone = req.body.phone !== undefined ? req.body.phone : admin.phone;
            admin.isActive = req.body.isActive !== undefined ? req.body.isActive : admin.isActive;

            const updatedAdmin = await admin.save();
            res.status(200).json({
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                phone: updatedAdmin.phone,
                isActive: updatedAdmin.isActive
            });
        } else {
            res.status(404);
            throw new Error('Admin not found');
        }
    } catch (error) {
        next(error);
    }
};
