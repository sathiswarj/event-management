import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    // Generate a JWT with the user's UUID instead of an ObjectId
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });

    res.cookie('user_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(res, user.userId);
            res.status(200).json({
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                telegramConnected: user.telegramConnected,
                token
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({ name, email, phone, password });
        if (user) {
            const token = generateToken(res, user.userId);
            res.status(201).json({ 
                userId: user.userId, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                token
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
    try {
        res.cookie('user_jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            expires: new Date(0),
        });
        res.status(200).json({ message: 'User logged out' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ userId: req.user.userId }).select('-password');
        
        if (user) {
            // Include dummy stats for now, later could be fetched from Request model
            const requestStats = {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };
            
            res.status(200).json({
                ...user.toJSON(),
                requestStats
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save();
            res.status(200).json(updatedUser);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Change Password
// @route   POST /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findOne({ userId: req.user.userId });

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(401);
            throw new Error('Incorrect current password');
        }
    } catch (error) {
        next(error);
    }
};
