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
                <li><a href="/ai">AI Bot</a></li>
                {/* Dashboard link removed */}
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
