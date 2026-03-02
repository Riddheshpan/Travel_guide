const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../modules/postModual');
const upload = require('../middleware/upload');

// @route   POST /api/posts
// @desc    Create a new community post (supports up to 4 images)
router.post('/', upload.array('images', 4), async (req, res) => {
    try {
        const { content, location, vibe, userId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const isValidId = userId && mongoose.Types.ObjectId.isValid(userId);
        if (!isValidId) {
            return res.status(400).json({
                success: false,
                message: 'Valid userId is required. Please log out and log back in.'
            });
        }

        const imageUrls = req.files ? req.files.map(f => f.path) : [];

        const newPost = new Post({
            user: userId,
            content: content.trim(),
            location: location || 'Global',
            vibe: vibe || 'Traveler',
            images: imageUrls
        });

        const post = await newPost.save();
        const populated = await Post.findById(post._id).populate('user', ['fName', 'lName']);
        res.json(populated);

    } catch (err) {
        console.error('POST /api/posts error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/posts
// @desc    Get all posts (with populated user and comment users)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', ['fName', 'lName'])
            .populate('comments.user', ['fName', 'lName']);
        res.json(posts);
    } catch (err) {
        console.error('GET /api/posts error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/posts/:id/like
// @desc    Toggle like on a post  (body: { userId })
router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Valid userId required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const alreadyLiked = post.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ success: true, likes: post.likes, liked: !alreadyLiked });

    } catch (err) {
        console.error('LIKE error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/posts/:id/comments
// @desc    Add a comment to a post  (body: { userId, text })
router.post('/:id/comments', async (req, res) => {
    try {
        const { userId, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Valid userId required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({ user: userId, text: text.trim() });
        await post.save();

        // Return the last comment, populated with user info
        const updated = await Post.findById(post._id).populate('comments.user', ['fName', 'lName']);
        const newComment = updated.comments[updated.comments.length - 1];

        res.json({ success: true, comment: newComment });

    } catch (err) {
        console.error('COMMENT error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;