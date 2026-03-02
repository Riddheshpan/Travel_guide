const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const jwtAuth = require('../middleware/jwtMiddleware');
const User = require('../modules/user');

// @route   PUT /api/user/avatar
// @desc    Update user profile picture
// @access  Private (JWT required)
router.put('/avatar', jwtAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, msg: 'No file uploaded' });
        }

        // req.file.path is the secure Cloudinary URL injected by multer-storage-cloudinary
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: req.file.path },
            { new: true, select: '-Password' }  // return updated doc without the password
        );

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: user.avatar,
            user
        });

    } catch (err) {
        console.error('Avatar upload error:', err.message);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

// @route   GET /api/user/me
// @desc    Get current logged-in user profile
// @access  Private (JWT required)
router.get('/me', jwtAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-Password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error('GET /me error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
