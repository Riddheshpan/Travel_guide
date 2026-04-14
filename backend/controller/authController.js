const bcrypt = require('bcrypt');
const userModel = require("../modules/user");
const OTPModel = require("../modules/otpModel");
const { sendOTP } = require("../utils/mailer");

const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        const { fName, lName, userId, email, password } = req.body;
        console.log('Password value:', password, 'Type:', typeof password);

        console.log('Received body:', req.body);
        const existingUser = await userModel.findOne({
            $or: [{ Email: email }, { UserId: userId }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            fName: fName,
            lName: lName,
            Email: email,
            UserId: userId,
            Password: hashedPassword
        });

        await newUser.save();

        // Generate and send an OTP for account verification
        const otpStr = Math.floor(100000 + Math.random() * 900000).toString();
        await OTPModel.deleteMany({ email });
        const newOtp = new OTPModel({ email, otp: otpStr });
        await newOtp.save();
        sendOTP(email, otpStr).catch(err => console.error('Background OTP issue:', err));

        res.status(201).json({
            success: true,
            message: 'Signup successful. Please check your email for the verification code!'
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('Login attempt body:', req.body);
        const { email } = req.body;
        // Handle both password and Password casing
        const password = req.body.password || req.body.Password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await userModel.findOne({ Email: email });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.Password) {
            console.error('User found but no password hash in DB for:', email);
            return res.status(500).json({
                success: false,
                message: 'Login failed: User data corrupted'
            });
        }

        if (user.isVerified === false) {
            // New users fall here, old users inherently pass (since their isVerified is undefined)
            return res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in.',
                requiresVerification: true
            });
        }

        const isPassEqual = await bcrypt.compare(password, user.Password);

        if (!isPassEqual) {
            return res.status(403).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const jwtToken = jwt.sign(
            { email: user.Email, _id: user._id },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            jwtToken,
            email: user.Email,
            name: user.fName,
            _id: user._id         // ✅ Send the MongoDB ObjectId to the frontend
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const otpStr = Math.floor(100000 + Math.random() * 900000).toString();
        await OTPModel.deleteMany({ email });
        const newOtp = new OTPModel({ email, otp: otpStr });
        await newOtp.save();
        const emailSent = await sendOTP(email, otpStr);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = await OTPModel.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const record = await OTPModel.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.findOneAndUpdate({ Email: email }, { Password: hashedPassword });
        await OTPModel.deleteMany({ email });
        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const verifyAccount = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP required' });
        }
        const record = await OTPModel.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        await userModel.findOneAndUpdate({ Email: email }, { isVerified: true });
        await OTPModel.deleteMany({ email });
        res.status(200).json({ success: true, message: 'Account verified successfully! You may now log in.' });
    } catch (err) {
        console.error('Verify account error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { signup, login, forgotPassword, verifyOTP, resetPassword, verifyAccount };
