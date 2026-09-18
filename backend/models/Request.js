import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const requestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        default: uuidv4,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    categoryId: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Confirmed', 'Date Conflict'],
        default: 'Pending'
    },
    adminNotes: {
        type: String
    },
    dateConflict: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

requestSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'userId',
    justOne: true
});

requestSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: 'categoryId',
    justOne: true
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
