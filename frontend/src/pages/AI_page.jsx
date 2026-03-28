import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './Pages_css/AI_page.css';
import DotGrid from './Style/dot';

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

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const TravelAIPage = () => {
    const navigate = useNavigate();
    const [activeMode, setActiveMode] = useState('form');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [itineraryResult, setItineraryResult] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your TravelAI specialist. Would you like to use the structured planner or just chat about your next trip?" }
    ]);
    const [formData, setFormData] = useState({
        destination: '', budget: '', duration: '3 days',
        dietary: 'Vegetarian', allergies: '', request: ''
    });
    const chatEndRef = useRef(null);
    const itineraryRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setItineraryResult(null);

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('http://localhost:8080/api/ai/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'Failed to generate plan');
            }

            if (data.error === "MODEL_WAKING_UP") {
                alert("The AI model is currently waking up from sleep. Please wait ~30 seconds and try again!");
                return;
            }

            setItineraryResult(data);

            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error("Failed to generate plan:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!itineraryResult) return;
        setIsDownloading(true);
        try {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const margin = 18;
            const maxW = pageW - margin * 2;
            let y = 20;

            // Header
            doc.setFillColor(82, 39, 255);
            doc.rect(0, 0, pageW, 14, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('TRAVELAI  ·  YOUR PERSONAL ITINERARY', margin, 9);

            // Trip Title
            y = 28;
            doc.setTextColor(20, 20, 40);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(itineraryResult.tripName || 'My Trip', margin, y);

            // Meta badges
            y += 10;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 120);
            doc.text([
                `Duration: ${itineraryResult.duration}`,
                `Budget: ${itineraryResult.budget}`,
                `Dietary: ${formData.dietary}`
            ].join('   ·   '), margin, y);

            // Divider
            y += 6;
            doc.setDrawColor(220, 218, 255);
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageW - margin, y);

            // Daily Plan
            y += 10;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(82, 39, 255);
            doc.text('Day-by-Day Plan', margin, y);

            (itineraryResult.dailyPlan || []).forEach((day, i) => {
                y += 10;
                if (y > 270) { doc.addPage(); y = 20; }

                // Day chip
                doc.setFillColor(240, 238, 255);
                doc.roundedRect(margin, y - 5, 28, 8, 2, 2, 'F');
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(82, 39, 255);
                doc.text(`Day ${i + 1}`, margin + 4, y);

                // Activity
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(20, 20, 40);
                const actLines = doc.splitTextToSize(day.activity || '', maxW - 32);
                doc.text(actLines, margin + 32, y);
                y += actLines.length * 5;

                // Food
                if (day.food) {
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(100, 100, 120);
                    const foodLines = doc.splitTextToSize(`Food: ${day.food}`, maxW - 32);
                    doc.text(foodLines, margin + 32, y);
                    y += foodLines.length * 4.5;
                }
            });

            // Tips
            if (itineraryResult.tips && itineraryResult.tips.length > 0) {
                y += 10;
                if (y > 260) { doc.addPage(); y = 20; }
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(82, 39, 255);
                doc.text('Travel Tips', margin, y);

                itineraryResult.tips.forEach(tip => {
                    y += 8;
                    if (y > 275) { doc.addPage(); y = 20; }
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(40, 40, 60);
                    const tipLines = doc.splitTextToSize(`✦  ${tip}`, maxW);
                    doc.text(tipLines, margin, y);
                    y += (tipLines.length - 1) * 5;
                });
            }

            // Footer
            const footerY = doc.internal.pageSize.getHeight() - 10;
            doc.setFontSize(7);
            doc.setTextColor(180, 180, 200);
            doc.text(`Generated by TravelAI  ·  ${new Date().toLocaleDateString()}`, margin, footerY);

            const filename = `${(itineraryResult.tripName || 'itinerary').replace(/\s+/g, '_')}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
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

            {/* ── DOT GRID BACKGROUND ── */}
            <div className="ai-dotgrid-bg">
                <DotGrid
                    dotSize={3}
                    gap={28}
                    baseColor="#2a1f5e"
                    activeColor="#7c3aed"
                    proximity={120}
                />
            </div>

            {/* ── HERO ── */}
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

            {/* ── MAIN ── */}
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
                    <section className="result-section" ref={itineraryRef}>
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

                        {/* ── PDF Download Button ── */}
                        <div className="result-actions">
                            <button className="download-pdf-btn" onClick={handleDownloadPDF} disabled={isDownloading}>
                                {isDownloading ? 'Generating PDF…' : <><DownloadIcon /> Download as PDF</>}
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default TravelAIPage;
