import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages_css/homepage.css';
import logo from '../assets/Logo.png';
import heroImage from '../assets/download.jpg';
import AIImage from '../assets/Icons/artificial-intelligence.png';
import MessageImage from '../assets/Icons/chat.png';
import CloudImage from '../assets/Icons/weather.png';
import SearchImage from '../assets/Icons/magnifier.png';
import KyotoImage from '../assets/Pictures/Kyoto.jpg';
import LondonImage from '../assets/Pictures/The Tower Bridge.jpg';
import NYCImage from '../assets/Pictures/New York City.jpg';
import TempleImage from '../assets/Pictures/Bylakuppe Buddhist Golden Temple.jpg';
import KashiImage from '../assets/Pictures/Kashi.jpg';
import RomeImage from '../assets/Pictures/Rome_ The Eternal City.jpg';

// FadeInSection component definition
function FadeInSection(props) {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            });
        }, { threshold: 0.2 });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}
            ref={domRef}
        >
            {props.children}
        </div>
    );
}


const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div className="homepage-container">
            {/* Navbar removed as it is now global */}

            {/* Hero Section */}
            <FadeInSection>
                <header className="hero-section">
                    <div className="hero-image-container">
                        <img
                            src={heroImage}
                            alt="Scenic Road"
                            className="hero-image"
                        />
                    </div>
                    <div className="hero-overlay">
                        <h1 className="hero-title">
                            Start Your Journey<br />
                            Today with us and<br />
                            places....
                        </h1>
                        <div className="hero-buttons">
                            <button className="btn-black">AI Bot</button>
                            <button className="btn-black" onClick={() => navigate('/chat')}>Read Post</button>
                        </div>
                    </div>
                </header>
            </FadeInSection>

            {/* Services Section */}
            <FadeInSection>
                <section className="services-section">
                    <h2 className="section-title">What We Provide?</h2>
                    <div className="services-grid">
                        {/* Card 1 */}
                        <div className="service-card">
                            <img src={AIImage} alt="AI Bot" className="service-icon" />
                            <p className="service-text">
                                AI Bot that will<br />
                                help you<br />
                                planning your<br />
                                Travel and<br />
                                solving Query
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="service-card">
                            <img src={MessageImage} alt="Message" className="service-icon" />
                            <p className="service-text">
                                Posting your<br />
                                thought of place<br />
                                real time in the<br />
                                community
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="service-card">
                            <img src={CloudImage} alt="Cloud" className="service-icon" />
                            <p className="service-text">
                                Real time Flight<br />
                                and weather<br />
                                Report of the<br />
                                place you<br />
                                destine to travel
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="service-card">
                            <img src={SearchImage} alt="Search" className="service-icon" />
                            <p className="service-text">
                                Search the post<br />
                                for your review<br />
                                Where you are<br />
                                destine to travel
                            </p>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* Explore Section */}
            <FadeInSection>
                <section className="explore-section">
                    <h2 className="section-title">Explore every corner of world</h2>
                    <div className="explore-grid">
                        {/* Column 1 */}
                        <div className="explore-col">
                            <div className="explore-card">
                                <img src={KyotoImage} alt="Kyoto" className="explore-image" />
                            </div>
                            <div className="explore-card">
                                <img src={LondonImage} alt="London" className="explore-image" />
                            </div>
                            <div className="explore-card-half-top">
                                <img src={NYCImage} alt="Statue of Liberty" className="explore-image half" />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="explore-col" >
                            <div className="explore-card-half-bottom">
                                <img src={TempleImage} alt="Temple" className="explore-image half" />
                            </div>
                            <div className="explore-card">
                                <img src={KashiImage} alt="Varanasi" className="explore-image" />
                            </div>
                            <div className="explore-card">
                                <img src={RomeImage} alt="Rome" className="explore-image" />
                            </div>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* Footer */}
            <FadeInSection>
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-text-block">
                            <p className="footer-desc">
                                Empowering travelers with agentic AI intelligence. Plan, explore, and share your journeys in a new way.
                            </p>
                        </div>

                        <div className="footer-links-container">
                            <div className="footer-column">
                                <h4>Explore</h4>
                                <ul>
                                    <li>-AI Itinerary Planner</li>
                                    <li>-Community Feed</li>
                                    <li>-Destination Vibe Check</li>
                                    <li>-Weather Insights</li>
                                </ul>
                            </div>
                            <div className="footer-column">
                                <h4>About</h4>
                                <ul>
                                    <li>-About AI</li>
                                    <li>-Tech Stack</li>
                                    <li>-Safety guidelines</li>
                                    <li>-Documentation</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <span style={{ fontWeight: 500 }}>Made with Love</span>
                        <span style={{ fontWeight: 500 }}>2026 Travel Guide . AI . Software Engineering</span>
                        <span style={{ fontWeight: 500 }}>Build With MERN Stack</span>
                    </div>
                </footer>
            </FadeInSection>
        </div>
    );
};

export default HomePage;