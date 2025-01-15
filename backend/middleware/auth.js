// backend/middleware/auth.js

import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT tokens from cookies or Authorization header
 */
export const verifyToken = (req, res, next) => {
    // Attempt to retrieve the token from cookies
    let token = req.cookies.accessToken;

    // If not found in cookies, attempt to retrieve from the Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If token still not found, deny access
    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    const secretKey = process.env.JWT_SECRET;

    try {
        // Verify the token
        const decoded = jwt.verify(token, secretKey);

        // Attach user information to the request object
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token expiration
        if (error.name === 'TokenExpiredError') {
            // Clear the expired token cookie
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Ensure secure flag only in production
                sameSite: "strict"
            });
            return res.status(401).json({ message: 'Token expired' });
        } else {
            // Handle other token verification errors
            return res.status(403).json({ message: 'Invalid token' });
        }
    }
};