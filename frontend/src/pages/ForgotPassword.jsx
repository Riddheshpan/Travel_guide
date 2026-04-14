import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from './util';
import './Pages_css/login.css';
import DotGrid from './Style/dot';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return handleError("Email is required");
        
        try {
            const res = await fetch("/auth/forgot-password", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                handleSuccess(data.message);
                setStep(2);
            } else {
                handleError(data.message || "Failed to send OTP");
            }
        } catch (err) {
            handleError(err);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return handleError("OTP is required");
        try {
            const res = await fetch("/auth/verify-otp", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (data.success) {
                handleSuccess(data.message);
                setStep(3);
            } else {
                handleError(data.message || "Invalid OTP");
            }
        } catch (err) {
            handleError(err);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) return handleError("New password is required");
        
        try {
            const res = await fetch("/auth/reset-password", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                handleSuccess("Password reset successfully. Please login.");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                handleError(data.message || "Failed to reset password");
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
            <div className="container" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="form-container" style={{ width: '100%', left: 0, zIndex: 2 }}>
                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <h1>Forgot Password</h1>
                            <span style={{ marginBottom: '15px' }}>Enter your email to receive an OTP</span>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                            <button type="submit">Send OTP</button>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{marginTop: '15px'}}>Back to Login</a>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <h1>Verify OTP</h1>
                            <span style={{ marginBottom: '15px' }}>Enter the 6-digit OTP sent to {email}</span>
                            <input 
                                type="text" 
                                placeholder="OTP" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                            />
                            <button type="submit">Verify</button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <h1>Reset Password</h1>
                            <span style={{ marginBottom: '15px' }}>Enter your new password</span>
                            <input 
                                type="password" 
                                placeholder="New Password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                            />
                            <button type="submit">Reset Password</button>
                        </form>
                    )}
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

export default ForgotPassword;
