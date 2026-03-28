const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const { location } = req.query;
        if (!location) {
            return res.status(400).json({ error: 'Location is required' });
        }

        const apiKey = process.env.weather_api; // Must match .env
        if (!apiKey) {
            return res.status(500).json({ error: 'Weather API key not configured' });
        }

        // Determining whether the API is WeatherAPI.com based on key length/format
        // Using the standard WeatherAPI forecast endpoint (fetches current + x days ahead)
        const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json`, {
            params: {
                key: apiKey,
                q: location,
                days: 7, // Asking for multi-day forecast
                aqi: 'no',
                alerts: 'no'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Weather API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

module.exports = router;
