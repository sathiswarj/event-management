import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    features: [{
        type: String
    }],
    img: {
        type: String,
        default: '/images/corporate.jpg'
    },
    longDesc: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
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

const Category = mongoose.model('Category', categorySchema);

export default Category;
