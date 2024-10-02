const jwt = require('jsonwebtoken');

// Middleware to protect routes
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        
        // If token is valid, store user info in request
        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;
