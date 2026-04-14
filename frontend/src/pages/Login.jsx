import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './util';
import './Pages_css/login.css';
import DotGrid from './Style/dot';

function LoginSignup() {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [verifyMode, setVerifyMode] = useState(false);
    const [emailToVerify, setEmailToVerify] = useState('');
    const [verifyOtp, setVerifyOtp] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/auth/verify-account", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToVerify, otp: verifyOtp })
            });
            const result = await response.json();
            if (result.success) {
                handleSuccess(result.message);
                setVerifyMode(false);
                setIsSignUpMode(false);
            } else {
                handleError(result.message);
            }
        } catch (err) {
            handleError(err);
        }
    };

    useEffect(() => {
        if (location.pathname === '/signup') {
            setIsSignUpMode(true);
        } else {
            setIsSignUpMode(false);
        }
    }, [location.pathname]);

    const handleModeSwitch = (mode) => {
        setIsSignUpMode(mode === 'signup');
        navigate(mode === 'signup' ? '/signup' : '/login');
    };
    const [signupInfo, setSignupInfo] = useState({
        fName: '',
        lName: '',
        userId: '',
        email: '',
        password: ''
    });

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { fName, lName, userId, email, password } = signupInfo;
        if (!fName || !lName || !userId || !email || !password) {
            return handleError('All fields are required');
        }
        try {
            const url = "/auth/signin";
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setEmailToVerify(signupInfo.email);
                setTimeout(() => {
                    setVerifyMode(true);
                }, 1000);
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    };

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('Email and password are required');
        }
        try {
            const url = "/auth/login";
            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, _id, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', _id);  // ✅ Store MongoDB _id for post creation
                setTimeout(() => {
                    navigate('/chat');
                }, 1000);
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                if (result.requiresVerification) {
                    setEmailToVerify(loginInfo.email);
                    setVerifyMode(true);
                    handleError(message);
                } else {
                    handleError(message);
                }
            }
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <div className="login-wrapper">
            <DotGrid
                dotSize={2}
                gap={24}
                baseColor="#222222"
                activeColor="#ffffff"
                proximity={100}
                shockRadius={200}
                shockStrength={3}
                resistance={800}
                returnDuration={1}
                style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />
            <div className={`container ${isSignUpMode ? 'right-panel-active' : ''}`} id="container">
                {/* Sign Up Form */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignup}>
                        <h1>Create Account</h1>

                        <input type="text" name="fName" placeholder="First Name" onChange={handleSignupChange} value={signupInfo.fName} />
                        <input type="text" name="lName" placeholder="Last Name" onChange={handleSignupChange} value={signupInfo.lName} />
                        <input type="text" name="userId" placeholder="User ID" onChange={handleSignupChange} value={signupInfo.userId} />
                        <input type="email" name="email" placeholder="Email" onChange={handleSignupChange} value={signupInfo.email} />
                        <input type="password" name="password" placeholder="Password" onChange={handleSignupChange} value={signupInfo.password} />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>

                {/* Login Form */}
                <div className="form-container sign-in-container">
                    <form onSubmit={handleLogin}>
                        <h1>Sign in</h1>
                        <span>or use your account</span>
                        <input type="email" name="email" placeholder="Email" onChange={handleLoginChange} value={loginInfo.email} />
                        <input type="password" name="password" placeholder="Password" onChange={handleLoginChange} value={loginInfo.password} />
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Forgot your password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                </div>

                {/* Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login</p>
                            <button className="ghost" id="signIn" onClick={() => handleModeSwitch('login')}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello!</h1>
                            <p>Enter the world of travelling with us...</p>
                            <button className="ghost" id="signUp" onClick={() => handleModeSwitch('signup')}>Sign Up</button>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>

            {verifyMode && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '10px', width: '400px', textAlign: 'center' }}>
                        <h2 style={{ color: '#333', marginBottom: '20px' }}>Verify Your Email</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Please enter the 6-digit OTP sent to <br/><b>{emailToVerify}</b></p>
                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
                            <input type="text" placeholder="Enter OTP" value={verifyOtp} onChange={(e) => setVerifyOtp(e.target.value)} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '20px', width: '100%', backgroundColor: '#eee', color: '#333' }} />
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#5227ff', color: 'white' }}>Verify</button>
                                <button type="button" onClick={() => setVerifyMode(false)} style={{ flex: 1, padding: '12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #5227ff', backgroundColor: 'white', color: '#5227ff' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginSignup;