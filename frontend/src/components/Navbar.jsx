import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/Logo.png';
import accountIcon from '../assets/Icons/account.png';

const Navbar = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );

    useEffect(() => {
        const syncAuth = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
        };
        // Fires when localStorage changes in OTHER tabs
        window.addEventListener('storage', syncAuth);
        // Fires when logout happens in THIS tab (dispatched by Dashboard)
        window.addEventListener('authChange', syncAuth);
        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('authChange', syncAuth);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="logo-container">
                <a href="/">
                    <img src={logo} alt="Logo" className="logo" />
                </a>
            </div>
            <ul className="nav-links">
                <li><a href="/ai">AI Bot</a></li>
                <li><a href="/weather">Weather</a></li>
                <li><button onClick={() => navigate('/chat')} className="nav-btn">Post</button></li>
                <li><a href="/#about">About Us</a></li>
                {isAuthenticated ? (
                    <li>
                        <button onClick={() => navigate('/dashboard')} className="nav-profile-btn">
                            <img src={accountIcon} alt="Profile" className="nav-profile-avatar" />
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
