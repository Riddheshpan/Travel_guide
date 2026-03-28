const express = require('express');
const router = express.Router();
const Itinerary = require('../modules/itineraryModel');
const jwtAuth = require('../middleware/jwtMiddleware');

// GET /api/itinerary — fetch all itineraries for the logged-in user
router.get('/', jwtAuth, async (req, res) => {
    try {
        const items = await Itinerary.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, itineraries: items });
    } catch (err) {
        console.error('[Itinerary] GET error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to fetch itineraries' });
    }
});

// DELETE /api/itinerary/:id — delete one itinerary (owner only)
router.delete('/:id', jwtAuth, async (req, res) => {
    try {
        const item = await Itinerary.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: 'Not found' });
        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        await item.deleteOne();
        res.json({ success: true });
    } catch (err) {
        console.error('[Itinerary] DELETE error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to delete itinerary' });
    }
});

module.exports = router;
