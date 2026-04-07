import React, { useState, useEffect } from 'react';
import './Pages_css/weather.css';
import DotGrid from './Style/dot';


const WeatherPage = () => {
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [weather, setWeather] = useState(null);

    const fetchWeather = async (location) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();

            // Map the WeatherAPI response to our component's expected structure
            const mappedData = {
                temp: Math.round(data.current.temp_c),
                condition: data.current.condition.text,
                humidity: data.current.humidity,
                wind: Math.round(data.current.wind_kph),
                visibility: data.current.vis_km,
                feelsLike: Math.round(data.current.feelslike_c),
                high: Math.round(data.forecast.forecastday[0].day.maxtemp_c),
                low: Math.round(data.forecast.forecastday[0].day.mintemp_c),
                recommendation: data.current.temp_c > 28
                    ? "It's quite warm! Stay hydrated and prefer indoor or shaded tours during the afternoon."
                    : data.current.condition.text.toLowerCase().includes('rain')
                        ? "Rain is expected. Perfect time to visit museums or enjoy a local cafe!"
                        : "Great conditions for outdoor sightseeing and exploring the local area.",
                forecast: data.forecast.forecastday.map(day => ({
                    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: Math.round(day.day.avgtemp_c),
                    icon: day.day.condition.text.toLowerCase().includes('rain') ? 'cloud-rain'
                        : day.day.condition.text.toLowerCase().includes('cloud') ? 'cloud' : 'sun'
                }))
            };

            setWeather(mappedData);
            setCity(data.location.name); // Prefer the resolved API location name
        } catch (err) {
            console.error("Error fetching weather:", err);
            setError("Unable to retrieve weather for that location.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather('Delhi'); // Default on load
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        fetchWeather(search);
        setSearch('');
    };

    // Custom Inline SVGs
    const Icons = {
        Sun: () => (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
        ),
        Wind: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /></svg>
        ),
        Droplets: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6.2-4-6.2s-4 2.9-4 6.2c0 2.2 1.8 4 4 4z" /><path d="M17 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6.2-4-6.2s-4 2.9-4 6.2c0 2.2 1.8 4 4 4z" /></svg>
        ),
        Search: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        ),
        MapPin: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
        )
    };

    return (
        <div className="weather-wrapper">
            {/* ── DOT GRID BACKGROUND ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <DotGrid
                    dotSize={3}
                    gap={28}
                    baseColor="#0d1f2d"
                    activeColor="#1e6fa8"
                    proximity={120}
                />
            </div>
            <div className="weather-container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <div className="top-bar">
                    <div className="location-info">
                        <p>Travel Intelligence</p>
                        <h1><Icons.MapPin /> {city}</h1>
                    </div>
                    <form className="search-box" onSubmit={handleSearch}>
                        <span className="search-icon"><Icons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search destination..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                {/* Current Weather Card */}
                <div className="main-weather-card">
                    {loading && <div className="loading-overlay"><div className="spinner"></div></div>}

                    {error && <div style={{ gridColumn: '1 / -1', color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>}

                    {weather && (
                        <>
                            <div className="temp-display">
                                <p className="condition-text">{weather.condition}</p>
                                <h2 className="current-temp">{weather.temp}°</h2>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>H: {weather.high}°</span>
                                    <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>L: {weather.low}°</span>
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Feels Like</span>
                                    <span className="detail-value">{weather.feelsLike}°C</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Humidity</span>
                                    <span className="detail-value"><Icons.Droplets /> {weather.humidity}%</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Wind Speed</span>
                                    <span className="detail-value"><Icons.Wind /> {weather.wind} km/h</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Visibility</span>
                                    <span className="detail-value">{weather.visibility} km</span>
                                </div>
                            </div>

                            {/* Recommendation Box */}
                            <div className="rec-box" style={{ gridColumn: '1 / -1' }}>
                                <div style={{ background: '#4f46e5', padding: '10px', borderRadius: '12px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                </div>
                                <p><strong>AI Recommendation:</strong> {weather.recommendation}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* 5-Day Forecast */}
                <div style={{ marginBottom: '20px', paddingLeft: '10px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', color: '#444' }}>7-Day Travel Outlook</h3>
                </div>

                <div className="forecast-container">
                    {weather && weather.forecast && weather.forecast.map((f, i) => (
                        <div key={i} className="forecast-card">
                            <span className="forecast-day">{f.day}</span>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {f.icon === 'sun' ? <Icons.Sun /> :
                                    f.icon === 'cloud-rain' ? <Icons.Droplets /> : <Icons.Wind />}
                            </div>
                            <span className="forecast-temp">{f.temp}°</span>
                        </div>
                    ))}
                </div>

                {/* Footer info */}
                <div style={{ marginTop: '60px', textAlign: 'center', opacity: 0.2 }}>
                    <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        Proprietary Weather Distillation Engine v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeatherPage;
