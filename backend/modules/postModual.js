const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // ✅ Must match mongoose.model('user', ...) in user.js
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        default: "Global"
    },
    vibe: {
        type: String,
        default: "Traveler"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    images: [{ type: String }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
            text: { type: String, required: true, trim: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);