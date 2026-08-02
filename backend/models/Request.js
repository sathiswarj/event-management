import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        unique: true
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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
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
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    customerPhone: {
        type: String,
        required: [true, 'Please add a phone number']
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
    timestamps: true
});

requestSchema.pre('save', function(next) {
    if (!this.requestId) {
        // Generate a random 6-digit ID like REQ-123456
        this.requestId = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
    }
    if (typeof next === 'function') return next();
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
