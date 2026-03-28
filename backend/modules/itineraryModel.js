const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
    activity: { type: String, required: true },
    food: { type: String, default: '' }
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    tripName: { type: String, required: true },
    duration: { type: String, default: '' },
    budget: { type: String, default: '' },
    dailyPlan: { type: [daySchema], default: [] },
    tips: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
