import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Pages_css/Chat.css';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../assets/Icons/magnifier.png';
import accountIcon from '../assets/Icons/account.png';
import pictureIcon from '../assets/Icons/insert-picture-icon.png';
import logo from '../assets/Logo.png';
import globeIcon from '../assets/Icons/globe.png';
import bellIcon from '../assets/Icons/bell.png';

const Chat = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [commentText, setCommentText] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);

    // ─── Multi-image state ────────────────────────────────────────────────────
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const imageInputRef = useRef(null);

    // ─── User info ────────────────────────────────────────────────────────────
    const rawId = localStorage.getItem('userId');
    const isValidObjectId = rawId && /^[a-f\d]{24}$/i.test(rawId);
    const currentUserId = isValidObjectId ? rawId : null;
    const currentUserName = localStorage.getItem('loggedInUser') || 'You';
    const currentUserAvatar = localStorage.getItem('avatar') || accountIcon;

    // ─── 1. Fetch posts ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get('/api/posts');
                setPosts(res.data);
            } catch (err) {
                console.error('Error fetching posts', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
    }, [previewUrls]);

    // ─── 2. Image selection ───────────────────────────────────────────────────
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        if (files.length === 0) return;
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedImages(files);
        setPreviewUrls(files.map(f => URL.createObjectURL(f)));
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // ─── 3. Create a new post ─────────────────────────────────────────────────
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        if (!currentUserId) {
            alert('Your session is outdated. Please log out and log back in.');
            localStorage.removeItem('userId');
            return;
        }
        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append('content', newPostContent.trim());
            formData.append('location', newPostLocation || 'Global');
            formData.append('vibe', 'Traveler');
            formData.append('userId', currentUserId);
            selectedImages.forEach(file => formData.append('images', file));

            const res = await axios.post('/api/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPosts(prev => [res.data, ...prev]);
            setNewPostContent('');
            setNewPostLocation('');
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setSelectedImages([]);
            setPreviewUrls([]);
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not create post.';
            alert(msg);
        } finally {
            setIsPosting(false);
        }
    };

    // ─── 4. Toggle Like ────────────────────────────────────────────────────────
    const handleLike = async (postId) => {
        if (!currentUserId) return alert('Please log in to like posts.');
        try {
            const res = await axios.put(`/api/posts/${postId}/like`, { userId: currentUserId });
            // Update in posts list
            setPosts(prev => prev.map(p =>
                p._id === postId ? { ...p, likes: res.data.likes } : p
            ));
            // Update selected post in modal
            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => ({ ...prev, likes: res.data.likes }));
            }
        } catch (err) {
            console.error('Like error', err);
        }
    };

    // ─── 5. Add Comment ────────────────────────────────────────────────────────
    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !selectedPost) return;
        if (!currentUserId) return alert('Please log in to comment.');

        setIsCommenting(true);
        try {
            const res = await axios.post(`/api/posts/${selectedPost._id}/comments`, {
                userId: currentUserId,
                text: commentText.trim()
            });
            // Append new comment to the modal post
            setSelectedPost(prev => ({
                ...prev,
                comments: [...(prev.comments || []), res.data.comment]
            }));
            // Update comment count in the feed list
            setPosts(prev => prev.map(p =>
                p._id === selectedPost._id
                    ? { ...p, comments: [...(p.comments || []), res.data.comment] }
                    : p
            ));
            setCommentText('');
        } catch (err) {
            console.error('Comment error', err);
        } finally {
            setIsCommenting(false);
        }
    };

    // ─── 6. Modal helpers ──────────────────────────────────────────────────────
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setCommentText('');
    };
    const closePost = () => setSelectedPost(null);

    // ─── 7. Helpers ───────────────────────────────────────────────────────────
    const getAuthorName = (post) => {
        if (post.user && post.user.fName) {
            return `${post.user.fName} ${post.user.lName || ''}`.trim();
        }
        return 'Traveler';
    };

    const getCommentAuthor = (comment) => {
        if (comment.user && comment.user.fName) {
            return `${comment.user.fName} ${comment.user.lName || ''}`.trim();
        }
        return 'Traveler';
    };

    const isLikedByMe = (post) =>
        currentUserId && post.likes && post.likes.some(id =>
            (typeof id === 'object' ? id._id?.toString() : id?.toString()) === currentUserId
        );

    const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.location && post.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        getAuthorName(post).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="chat-layout">

            {/* ─── MODAL ─────────────────────────────────────────────────── */}
            {selectedPost && (
                <div className="modal-overlay" onClick={closePost}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="post-header">
                            <div className="user-avatar-small-wrapper">
                                <img src={accountIcon} alt="User" className="user-avatar-small-img" />
                            </div>
                            <div>
                                <span className="username">{getAuthorName(selectedPost)}</span>
                                <p className="post-date">
                                    {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Images */}
                        {selectedPost.images && selectedPost.images.length > 0 ? (
                            <div className="modal-images-row">
                                {selectedPost.images.map((url, i) => (
                                    <img key={i} src={url} alt={`Post image ${i + 1}`} className="modal-post-image" />
                                ))}
                            </div>
                        ) : (
                            <div className="post-image-placeholder">
                                <img src={pictureIcon} alt="Post Image" className="post-placeholder-icon" />
                            </div>
                        )}

                        {/* Post text */}
                        <div className="post-content">
                            {selectedPost.location && selectedPost.location !== 'Global' && (
                                <p className="modal-location">📍 {selectedPost.location}</p>
                            )}
                            <p>{selectedPost.content}</p>
                        </div>

                        {/* ── Like & Stats bar ───────────────────────────── */}
                        <div className="modal-reactions-bar">
                            <button
                                className={`like-btn ${isLikedByMe(selectedPost) ? 'liked' : ''}`}
                                onClick={() => handleLike(selectedPost._id)}
                            >
                                {isLikedByMe(selectedPost) ? '❤️' : '🤍'}
                                <span>{selectedPost.likes ? selectedPost.likes.length : 0}</span>
                            </button>
                            <span className="comment-count-label">
                                💬 {selectedPost.comments ? selectedPost.comments.length : 0} comments
                            </span>
                        </div>

                        {/* ── Comments list ──────────────────────────────── */}
                        <div className="comments-section">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                <div className="comments-list">
                                    {selectedPost.comments.map((c, i) => (
                                        <div key={c._id || i} className="comment-item">
                                            <img src={accountIcon} alt="" className="comment-avatar" />
                                            <div className="comment-body">
                                                <span className="comment-author">{getCommentAuthor(c)}</span>
                                                <p className="comment-text">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-comments">No comments yet. Be the first! 👇</p>
                            )}

                            {/* Comment input */}
                            <form className="comment-form" onSubmit={handleComment}>
                                <img src={currentUserAvatar} alt="You" className="comment-avatar" />
                                <input
                                    type="text"
                                    className="comment-input"
                                    placeholder="Add a comment…"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="comment-submit-btn"
                                    disabled={isCommenting || !commentText.trim()}
                                >
                                    {isCommenting ? '…' : '↑'}
                                </button>
                            </form>
                        </div>

                        <button className="modal-close-btn" onClick={closePost}>✕ Close</button>
                    </div>
                </div>
            )}

            {/* ─── DOCK ───────────────────────────────────────────────────── */}
            <aside className="chat-dock">
                <div className="dock-logo" onClick={() => navigate('/')}>
                    <img src={logo} alt="Logo" className="dock-logo-img" />
                </div>
                <nav className="dock-nav">
                    <button className="dock-item active" title="Explore">
                        <img src={globeIcon} alt="Explore" className="dock-icon-img" />
                    </button>
                    <button className="dock-item" title="Notifications">
                        <img src={bellIcon} alt="Notifications" className="dock-icon-img" />
                    </button>
                    <button className="dock-item" onClick={() => navigate('/dashboard')} title="Profile">
                        <img src={accountIcon} alt="Profile" className="dock-icon-img" />
                    </button>
                </nav>
                <div className="dock-action">
                    <button
                        className="dock-post-btn"
                        title="New Post"
                        onClick={() => document.getElementById('post-input').focus()}
                    >
                        <span className="plus-icon">+</span>
                    </button>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ───────────────────────────────────────────── */}
            <main className="chat-main">
                <header className="gallery-header">
                    <h1>Travel Stories</h1>
                    <div className="header-controls">
                        <div className="search-pill">
                            <img src={searchIcon} alt="Search" className="search-icon-img" />
                            <input
                                type="text"
                                placeholder="Search places or people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* ── CREATE POST CARD ─────────────────────────────────────── */}
                <form className="create-post-card" onSubmit={handlePostSubmit}>
                    <div className="create-post-input">
                        <img src={currentUserAvatar} alt="User" className="user-avatar-img" />
                        <textarea
                            id="post-input"
                            className="post-textarea"
                            placeholder="Share your latest adventure..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="create-post-location">
                        <input
                            type="text"
                            className="location-input"
                            placeholder="📍 Add a location (e.g. Kyoto, Japan)"
                            value={newPostLocation}
                            onChange={(e) => setNewPostLocation(e.target.value)}
                        />
                    </div>

                    {previewUrls.length > 0 && (
                        <div className="image-preview-row">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="preview-thumb-wrapper">
                                    <img src={url} alt={`Preview ${i + 1}`} className="preview-thumb" />
                                    <button type="button" className="remove-preview-btn" onClick={() => removeImage(i)}>✕</button>
                                </div>
                            ))}
                            {previewUrls.length < 4 && (
                                <button type="button" className="add-more-btn" onClick={() => imageInputRef.current.click()}>+</button>
                            )}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png"
                        multiple
                        ref={imageInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />

                    <div className="create-post-actions">
                        <button type="button" className="action-pill" onClick={() => imageInputRef.current.click()}>
                            <img src={pictureIcon} alt="Photo" className="action-icon-img" />
                            {selectedImages.length > 0 ? `${selectedImages.length} photo${selectedImages.length > 1 ? 's' : ''}` : 'Photo'}
                        </button>
                        <button type="submit" className="post-btn-small" disabled={isPosting || !newPostContent.trim()}>
                            {isPosting ? 'Posting…' : 'Post'}
                        </button>
                    </div>
                </form>

                {/* ── FEED ─────────────────────────────────────────────────── */}
                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Loading travel stories…</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="empty-state">
                        <p>🌍</p>
                        <p>{searchQuery ? `No posts match "${searchQuery}"` : 'No stories yet. Be the first to share one!'}</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {filteredPosts.map((post) => (
                            <div key={post._id} className="gallery-card" onClick={() => handlePostClick(post)}>
                                <div
                                    className="card-image-area"
                                    style={post.images && post.images[0]
                                        ? { backgroundImage: `url(${post.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}}
                                >
                                    <div className="image-overlay">
                                        <span className="location-tag">📍 {post.location || 'Global'}</span>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="card-user">
                                        <img src={accountIcon} alt="User" className="card-user-avatar" />
                                        <span className="card-username">{getAuthorName(post)}</span>
                                        {post.images && post.images.length > 0 && (
                                            <span className="card-image-count">🖼 {post.images.length}</span>
                                        )}
                                    </div>
                                    <p className="card-snippet">{post.content}</p>
                                    <div className="card-stats">
                                        <span className={`card-like-indicator ${isLikedByMe(post) ? 'liked' : ''}`}>
                                            {isLikedByMe(post) ? '❤️' : '🤍'} {post.likes ? post.likes.length : 0}
                                        </span>
                                        <span>💬 {post.comments ? post.comments.length : 0}</span>
                                        <span className="post-date-small">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Chat;
