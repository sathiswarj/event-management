import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const requestSchema = new mongoose.Schema({
    requestId: {
        type: String,
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
    customerName: {
        type: String,
        required: [true, 'Please add your name'],
        trim: true
    },
    customerEmail: {
        type: String,
        required: [true, 'Please add your email'],

    },
    customerPhone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    telegramChatId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['New', 'In Review', 'Approved', 'Rejected'],
        default: 'New'
    },
    adminNotes: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
