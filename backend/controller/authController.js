const bcrypt = require('bcrypt');
const userModel = require("../modules/user");

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

        res.status(201).json({
            success: true,
            message: 'Signup successful'
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

module.exports = { signup, login };
