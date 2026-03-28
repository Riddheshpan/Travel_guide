import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './Pages_css/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import dashboardIcon from '../assets/Icons/dashboard.png';
import aiIcon from '../assets/Icons/artificial-intelligence.png';
import searchIcon from '../assets/Icons/magnifier.png';
import pictureIcon from '../assets/Icons/insert-picture-icon.png';
import chatIcon from '../assets/Icons/chat.png';
import weatherIcon from '../assets/Icons/weather.png';
import accountIcon from '../assets/Icons/account.png';

const Dashboard = () => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        localStorage.setItem('isAuthenticated', 'true');
    }, []);

    // User State — avatar is stored per-user under avatar_<userId> to avoid cross-user bleed
    const [userProfile, setUserProfile] = useState({
        name: localStorage.getItem('loggedInUser') || "Traveler",
        handle: "@traveler",
        bio: "Exploring the world one adventure at a time.",
        avatar: localStorage.getItem(`avatar_${localStorage.getItem('userId')}`) || accountIcon
    });

    // Fetch real profile from backend on mount so each user sees their own data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    const { fName, lName, avatar } = res.data.user;
                    const name = `${fName} ${lName}`;
                    const userId = localStorage.getItem('userId');
                    // Update localStorage with current user's real data
                    localStorage.setItem('loggedInUser', name);
                    if (avatar) localStorage.setItem(`avatar_${userId}`, avatar);
                    setUserProfile(prev => ({
                        ...prev,
                        name,
                        avatar: avatar || prev.avatar
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err.message);
            }
        };
        fetchProfile();
    }, []);

    // ─── User's real posts from backend ────────────────────────────────────────
    const [myRecentPosts, setMyRecentPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const currentUserId = localStorage.getItem('userId');

    const fetchMyPosts = async () => {
        try {
            const res = await axios.get('/api/posts');
            // Filter to only this user's posts, take latest 3
            const mine = res.data
                .filter(p => p.user && p.user._id === currentUserId)
                .slice(0, 3);
            setMyRecentPosts(mine);
        } catch (err) {
            console.error('Failed to fetch posts:', err.message);
        } finally {
            setPostsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
        // Poll every 30 seconds for new posts
        const interval = setInterval(fetchMyPosts, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper: convert ISO date → relative time string
    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // Real itinerary history from backend
    const [itineraryHistory, setItineraryHistory] = useState([]);
    const [itineraryLoading, setItineraryLoading] = useState(true);

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('/api/itinerary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setItineraryHistory(res.data.itineraries);
            } catch (err) {
                console.error('Failed to fetch itineraries:', err.message);
            } finally {
                setItineraryLoading(false);
            }
        };
        fetchItineraries();
    }, []);

    const downloadItineraryPDF = (plan) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 18;
        const maxW = pageW - margin * 2;
        let y = 20;

        doc.setFillColor(82, 39, 255);
        doc.rect(0, 0, pageW, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TRAVELAI  ·  YOUR PERSONAL ITINERARY', margin, 9);

        y = 28;
        doc.setTextColor(20, 20, 40);
        doc.setFontSize(22);
        doc.text(plan.tripName || 'My Trip', margin, y);

        y += 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 120);
        doc.text(`Duration: ${plan.duration}   ·   Budget: ${plan.budget}`, margin, y);

        y += 6;
        doc.setDrawColor(220, 218, 255);
        doc.line(margin, y, pageW - margin, y);

        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(82, 39, 255);
        doc.text('Day-by-Day Plan', margin, y);

        (plan.dailyPlan || []).forEach((day, i) => {
            y += 10;
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFillColor(240, 238, 255);
            doc.roundedRect(margin, y - 5, 28, 8, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(82, 39, 255);
            doc.text(`Day ${i + 1}`, margin + 4, y);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(20, 20, 40);
            const actLines = doc.splitTextToSize(day.activity || '', maxW - 32);
            doc.text(actLines, margin + 32, y);
            y += actLines.length * 5;
            if (day.food) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 120);
                const fLines = doc.splitTextToSize(`Food: ${day.food}`, maxW - 32);
                doc.text(fLines, margin + 32, y);
                y += fLines.length * 4.5;
            }
        });

        if (plan.tips && plan.tips.length > 0) {
            y += 10;
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(82, 39, 255);
            doc.text('Travel Tips', margin, y);
            plan.tips.forEach(tip => {
                y += 8;
                if (y > 275) { doc.addPage(); y = 20; }
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40, 40, 60);
                const tLines = doc.splitTextToSize(`✦  ${tip}`, maxW);
                doc.text(tLines, margin, y);
                y += (tLines.length - 1) * 5;
            });
        }

        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 200);
        doc.text(`Generated by TravelAI  ·  ${new Date().toLocaleDateString()}`, margin, footerY);
        doc.save(`${(plan.tripName || 'itinerary').replace(/\s+/g, '_')}.pdf`);
    };

    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setIsUploading(true);

        try {
            const token = localStorage.getItem('token');
            console.log('[Avatar Upload] Token from localStorage:', token ? token.substring(0, 30) + '...' : 'NULL/MISSING');
            const res = await axios.put('/api/user/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            // Persist avatar URL under a per-user key so it never bleeds to other users
            const userId = localStorage.getItem('userId');
            localStorage.setItem(`avatar_${userId}`, res.data.avatar);
            setUserProfile(prev => ({ ...prev, avatar: res.data.avatar }));
        } catch (err) {
            const errData = err.response?.data;
            console.error('Upload failed:', errData || err.message);
            alert(`Avatar upload failed:\nMessage: ${errData?.message || err.message}\nReason: ${errData?.reason || 'unknown'}`);
        } finally {
            setIsUploading(false);
            // Reset so same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('loggedInUser');
        // Notify Navbar in the same tab so it switches to Login/Sign up immediately
        window.dispatchEvent(new Event('authChange'));
        setIsLoggingOut(true);
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    return (
        <div className="dashboard-container">

            {/* MAIN CONTENT (Full Width) */}
            <main className="main-content full-width">

                <header className="dashboard-header">
                    <div className="header-left">
                        <div className="logo-section">
                            <img src={dashboardIcon} alt="Logo" className="header-logo-img" />
                            <h1 className="header-title">Dashboard</h1>
                        </div>
                    </div>

                    <div className="search-box">
                        <img src={searchIcon} alt="Search" className="search-icon-img-small" />
                        <input type="text" placeholder="Search your activity..." className="search-input" />
                    </div>

                    <div className="header-right">
                        <div className="user-menu-trigger" onClick={() => setIsProfileModalOpen(true)}>
                            <img src={userProfile.avatar} alt="Profile" className="header-avatar" />
                            <span className="header-username">{userProfile.name}</span>
                        </div>
                        <button onClick={handleLogout} className="header-logout-btn" title="Logout">
                            <span className="logout-icon">logout</span>
                        </button>
                    </div>
                </header>

                <div className="dashboard-grid">

                    {/* LEFT SECTION: RECENT POSTS & HISTORY */}
                    <div className="left-column">

                        {/* MY RECENT POSTS SECTION */}
                        <section className="posts-section">
                            <div className="section-header-row">
                                <div className="flex-align-center">
                                    <img src={chatIcon} alt="Feed" className="section-icon-img" />
                                    <h2 className="section-heading">Your Recent Posts</h2>
                                </div>
                                <button className="link-btn" onClick={() => navigate('/chat')}>View All Activity</button>
                            </div>
                            <div className="posts-list">
                                {postsLoading ? (
                                    <p style={{ color: '#555', fontSize: '0.9rem', padding: '12px 0' }}>Loading your posts…</p>
                                ) : myRecentPosts.length === 0 ? (
                                    <p style={{ color: '#555', fontSize: '0.9rem', padding: '12px 0' }}>
                                        No posts yet. <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/chat')}>Share your first story →</span>
                                    </p>
                                ) : (
                                    myRecentPosts.map(post => (
                                        <div key={post._id} className="post-item" onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>
                                            <div className="post-meta-top">
                                                <div className="post-tags">
                                                    <span className="tag-location">📍 {post.location || 'Global'}</span>
                                                    <span className="tag-vibe">✨ {post.vibe || 'Traveler'}</span>
                                                </div>
                                                <span className="post-time">{timeAgo(post.createdAt)}</span>
                                            </div>
                                            <p className="post-content">{post.content}</p>
                                            <div className="post-actions">
                                                <div className="action-stat">
                                                    <span className="action-icon">❤️</span>
                                                    <span className="action-val">{post.likes ? post.likes.length : 0}</span>
                                                </div>
                                                <div className="action-stat">
                                                    <span className="action-icon">💬</span>
                                                    <span className="action-val">{post.comments ? post.comments.length : 0}</span>
                                                </div>
                                                <div className="action-stat">
                                                    <span className="action-icon">↗️</span>
                                                    <span className="action-val">Share</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* ITINERARY HISTORY SECTION */}
                        <section className="history-section">
                            <div className="section-header-row mb-6">
                                <div className="flex-align-center">
                                    <img src={weatherIcon} alt="History" className="section-icon-img" />
                                    <h2 className="section-heading">Saved Itinerary History</h2>
                                </div>
                                <div className="header-filters">
                                    <span className="filter-item active">Archive</span>
                                </div>
                            </div>

                            <div className="history-grid">
                                {itineraryLoading ? (
                                    <p style={{ color: '#555', fontSize: '0.9rem', padding: '12px 0', gridColumn: '1/-1' }}>Loading itineraries…</p>
                                ) : itineraryHistory.length === 0 ? (
                                    <p style={{ color: '#555', fontSize: '0.9rem', padding: '12px 0', gridColumn: '1/-1' }}>
                                        No saved itineraries yet. <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/ai')}>Generate one with AI →</span>
                                    </p>
                                ) : (
                                    itineraryHistory.map(plan => (
                                        <div key={plan._id} className="history-card">
                                            <div className="history-card-header">
                                                <div>
                                                    <p className="history-date">{new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    <h4 className="history-title">{plan.tripName}</h4>
                                                </div>
                                                <div className="budget-tag">{plan.budget || '—'}</div>
                                            </div>
                                            <div className="history-image-placeholder">
                                                🗺️
                                                <div className="overlay-btn-container">
                                                    <button className="view-details-btn" onClick={() => downloadItineraryPDF(plan)}>⬇ Download PDF</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: USER PROFILE STATS & SYSTEM HEALTH */}
                    <div className="right-column">

                        {/* ACTIVE SESSION CARD */}
                        <section className="active-session-card">
                            <div className="session-content">
                                <div className="flex-align-center mb-4">
                                    <img src={aiIcon} alt="Zap" className="card-top-icon" />
                                    <span className="card-top-label">Knowledge Distillation Model</span>
                                </div>
                                <h3 className="session-title">"Llama-3 Travel Specialist"</h3>
                                <div className="progress-container">
                                    <div className="progress-label-row">
                                        <span className="progress-label">Training Progress</span>
                                        <span className="progress-val">100%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-bar"></div>
                                    </div>
                                </div>
                                <button className="access-ai-btn" onClick={() => navigate('/ai')}>
                                    Access Dedicated AI Page
                                </button>
                            </div>
                        </section>

                        {/* Profile Stats Glance */}
                        <section className="stats-card">
                            <div className="profile-glance-header">
                                <img src={userProfile.avatar} className="large-profile-avatar" alt="Profile" />
                                <div>
                                    <h3 className="glance-name">{userProfile.name}</h3>
                                    <p className="glance-handle">{userProfile.handle}</p>
                                </div>
                            </div>
                            <div className="stats-list">
                                {[
                                    { label: 'Itineraries Saved', val: itineraryLoading ? '…' : itineraryHistory.length },
                                    { label: 'Community Posts', val: myRecentPosts.length },
                                    { label: 'Network Connections', val: '124' },
                                ].map(s => (
                                    <div key={s.label} className="stat-row">
                                        <span className="stat-label">{s.label}</span>
                                        <span className="stat-val">{s.val}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="settings-btn"
                            >
                                Settings & Profile
                            </button>
                        </section>
                    </div>
                </div>
            </main>

            {/* 3. NEW REDESIGNED PROFILE MODAL */}
            {isProfileModalOpen && (
                <div className="modal-backdrop">
                    <div className="profile-modal-redesigned">
                        <button
                            onClick={() => setIsProfileModalOpen(false)}
                            className="close-modal-btn"
                        >
                            ❌
                        </button>

                        <div className="modal-banner"></div>

                        <div className="modal-content-wrapper">
                            <div className="modal-avatar-section">
                                <img src={userProfile.avatar} className="modal-avatar-large" alt="Profile" />
                                {/* Hidden file input — triggered by the button below */}
                                <input
                                    type="file"
                                    accept="image/jpg,image/jpeg,image/png"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button
                                    className="change-avatar-btn"
                                    onClick={() => fileInputRef.current.click()}
                                    title="Change profile picture"
                                    disabled={isUploading}
                                >
                                    {isUploading
                                        ? <span style={{ fontSize: '10px', color: '#aaa' }}>...</span>
                                        : <img src={pictureIcon} alt="Camera" className="camera-icon-mini" />
                                    }
                                </button>
                            </div>

                            <h2 className="modal-user-name">{userProfile.name}</h2>
                            <p className="modal-user-handle">{userProfile.handle}</p>

                            <div className="modal-form-grid">
                                <div className="modal-field">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={userProfile.name}
                                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                    />
                                </div>
                                <div className="modal-field">
                                    <label>Bio</label>
                                    <textarea
                                        value={userProfile.bio}
                                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="modal-cancel-btn" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                                <button className="modal-save-btn" onClick={() => setIsProfileModalOpen(false)}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
