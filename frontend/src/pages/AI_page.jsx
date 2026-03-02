import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages_css/AI_page.css';

const BotIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

const SendIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

const TravelAIPage = () => {
    const navigate = useNavigate();
    const [activeMode, setActiveMode] = useState('form');
    const [isGenerating, setIsGenerating] = useState(false);
    const [itineraryResult, setItineraryResult] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your TravelAI specialist. Would you like to use the structured planner or just chat about your next trip?" }
    ]);
    const [formData, setFormData] = useState({
        destination: '', budget: '', duration: '3 days',
        dietary: 'Vegetarian', allergies: '', request: ''
    });
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleGeneratePlan = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setItineraryResult(null);
        setTimeout(() => {
            setItineraryResult({
                tripName: `${formData.destination || 'Global'} Odyssey`,
                duration: formData.duration,
                budget: formData.budget || '$1500',
                dailyPlan: [
                    { day: 1, activity: 'Arrival and morning walking tour of the historical center.', food: 'Local specialty breakfast' },
                    { day: 2, activity: 'Afternoon hidden gems exploration and local markets.', food: 'Must-try street food spot' },
                    { day: 3, activity: 'Farewell sunset viewpoint and rooftop dinner.', food: 'Fine dining finale' }
                ],
                tips: ['Pack comfortable shoes', 'Use public transit', 'Book museums 2 weeks early']
            });
            setIsGenerating(false);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const input = e.target.chatInput.value.trim();
        if (!input) return;
        setChatMessages(prev => [...prev, { role: 'user', text: input }]);
        e.target.reset();
        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                text: `Great choice! Based on "${input}", I can craft a custom itinerary. Try the Structured Planner for a full day-by-day plan!`
            }]);
        }, 1000);
    };

    return (
        <div className="ai-page-wrapper">

            {/* ── HERO ────────────────────────────────────────────────── */}
            <div className="ai-hero">
                <div className="ai-hero-badge">
                    <BotIcon />
                    <span>Llama-3 · 8B · Travel Specialist</span>
                </div>
                <h1 className="ai-hero-title">
                    Plan your perfect trip <span className="ai-hero-accent">with AI</span>
                </h1>
                <p className="ai-hero-sub">
                    Fill in the form for a structured itinerary, or chat freely with the AI.
                </p>
                <div className="mode-switcher">
                    <button className={`mode-btn ${activeMode === 'form' ? 'active' : ''}`} onClick={() => setActiveMode('form')}>
                        ✦ Structured Planner
                    </button>
                    <button className={`mode-btn ${activeMode === 'chat' ? 'active' : ''}`} onClick={() => setActiveMode('chat')}>
                        ✦ Chat with AI
                    </button>
                </div>
            </div>

            {/* ── MAIN ────────────────────────────────────────────────── */}
            <main className="ai-main">

                {activeMode === 'form' ? (
                    <div className="ai-form-container">
                        <form className="ai-form" onSubmit={handleGeneratePlan}>
                            <div className="ai-form-grid">
                                <div className="ai-input-group">
                                    <label className="ai-label"><MapPinIcon /> Where do you want to visit?</label>
                                    <input className="ai-input" type="text" placeholder="e.g. Kyoto, Japan" required
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
                                </div>
                                <div className="ai-input-group">
                                    <label className="ai-label"><BotIcon /> Total Trip Budget?</label>
                                    <input className="ai-input" type="text" placeholder="e.g. $2,500"
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                                </div>
                            </div>

                            <div className="ai-input-group ai-input-group-wide">
                                <label className="ai-label"><BotIcon /> Dietary Preference</label>
                                <div className="preference-row">
                                    {['Vegetarian', 'Non-Veg', 'Vegan'].map(opt => (
                                        <button key={opt} type="button"
                                            className={`pref-btn ${formData.dietary === opt ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, dietary: opt })}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-form-grid">
                                <div className="ai-input-group">
                                    <label className="ai-label"><BotIcon /> How many days?</label>
                                    <select className="ai-select" onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
                                        <option>2 days</option><option>3 days</option>
                                        <option>5 days</option><option>1 week</option><option>10 days</option>
                                    </select>
                                </div>
                                <div className="ai-input-group">
                                    <label className="ai-label"><BotIcon /> Any Allergies?</label>
                                    <input className="ai-input" type="text" placeholder="Leave blank if none"
                                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} />
                                </div>
                            </div>

                            <div className="ai-input-group ai-input-group-top">
                                <label className="ai-label"><SparklesIcon /> Special Request?</label>
                                <textarea className="ai-textarea"
                                    placeholder="e.g. 'Focus on hidden shrines', 'Love photography spots'..."
                                    onChange={(e) => setFormData({ ...formData, request: e.target.value })} />
                            </div>

                            <button disabled={isGenerating} className="generate-btn" type="submit">
                                {isGenerating
                                    ? (<>Consulting Llama-3 <div className="ai-spinner" /></>)
                                    : (<>Generate Itinerary <SparklesIcon /></>)}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="chat-window">
                        <div className="chat-body">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`message-bubble ${msg.role === 'user' ? 'user-msg' : 'assistant-msg'}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="chat-footer">
                            <div className="chat-input-wrapper">
                                <input name="chatInput" className="chat-text-input"
                                    placeholder="Ask TravelAI anything..." autoComplete="off" />
                                <button type="submit" className="send-btn"><SendIcon /></button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Result ── */}
                {itineraryResult && (
                    <section className="result-section">
                        <div className="result-header">
                            <span className="result-tag">Your Itinerary</span>
                            <h2>{itineraryResult.tripName}</h2>
                            <div className="meta-tags">
                                <span>📅 {itineraryResult.duration}</span>
                                <span>💰 {itineraryResult.budget}</span>
                                <span>🌱 {formData.dietary}</span>
                            </div>
                        </div>
                        <div className="itinerary-list">
                            {itineraryResult.dailyPlan.map((day, i) => (
                                <div key={i} className="itinerary-card">
                                    <div className="day-num">{i + 1}</div>
                                    <div className="card-detail">
                                        <h4>Day {i + 1}</h4>
                                        <p>{day.activity}</p>
                                        <div className="card-meal">🍽️ {day.food}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="tip-pills">
                            {itineraryResult.tips.map(tip => (
                                <span key={tip} className="tip-pill">✦ {tip}</span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default TravelAIPage;
