const express = require('express');
const router = express.Router();
const { generateItineraryFromLlama } = require('../modules/AIService');
const Itinerary = require('../modules/itineraryModel');
const jwtAuth = require('../middleware/jwtMiddleware');
const jwt = require('jsonwebtoken');

router.post('/generate', async (req, res) => {
    try {
        const userData = req.body;

        if (!userData || !userData.destination) {
            return res.status(400).json({ error: 'Destination is required' });
        }

        console.log(`[AI] Generating itinerary for ${userData.destination}...`);

        const itinerary = await generateItineraryFromLlama(userData);

        // Auto-save to DB if the user is logged in (token present but optional)
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1].trim();
                const secret = (process.env.JWT_SECRET || 'secret123').trim();
                const decoded = jwt.verify(token, secret);
                const userId = decoded._id;

                await Itinerary.create({
                    user: userId,
                    tripName: itinerary.tripName || userData.destination,
                    duration: itinerary.duration || userData.duration,
                    budget: itinerary.budget || userData.budget,
                    dailyPlan: itinerary.dailyPlan || [],
                    tips: itinerary.tips || []
                });
                console.log(`[AI] Itinerary saved for user ${userId}`);
            } catch (saveErr) {
                // Non-fatal: generation succeeded even if save fails
                console.warn('[AI] Could not save itinerary to DB:', saveErr.message);
            }
        }

        res.json(itinerary);
    } catch (error) {
        console.error('AI Route Error:', error.message || error);

        if (error.message && error.message.includes('HF_API_ERROR')) {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to generate itinerary. Please try again later.' });
    }
});

module.exports = router;
