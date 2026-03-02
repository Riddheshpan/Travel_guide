const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1].trim();
    // .trim() on secret guards against any CRLF/whitespace in .env
    const secret = (process.env.JWT_SECRET || 'secret123').trim();

    console.log('[JWT] Secret being used (first 5 chars):', secret.substring(0, 5));
    console.log('[JWT] Token received (first 20 chars):', token.substring(0, 20));

    try {
        const decoded = jwt.verify(token, secret);
        // JWT payload has { email, _id } — expose as req.user.id for convenience
        req.user = { id: decoded._id, email: decoded.email };
        console.log('[JWT] Verified OK. User id:', req.user.id);
        next();
    } catch (err) {
        console.error('[JWT] Verification failed:', err.name, '-', err.message);
        return res.status(401).json({ success: false, message: 'Token is not valid', reason: err.name });
    }
};

module.exports = jwtAuth;
