import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/Logo.png';
import accountIcon from '../assets/Icons/account.png';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return (
        <nav className="navbar">
            <div className="logo-container">
                <a href="/">
                    <img src={logo} alt="Logo" className="logo" />
                </a>
            </div>
            <ul className="nav-links">
                <li><a href="/#ai-bot">AI Bot</a></li>
                {/* Dashboard link removed */}
                <li><button onClick={() => navigate('/chat')} className="nav-btn">Post</button></li>
                <li><a href="/#about">About Us</a></li>
                {isAuthenticated ? (
                    <li>
                        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={accountIcon} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #333', backgroundColor: '#fff', objectFit: 'cover' }} />
                        </button>
                    </li>
                ) : (
                    <li><a href="/login">Login/Sign up</a></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
