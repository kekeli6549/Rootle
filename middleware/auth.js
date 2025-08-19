// This file will contain the middleware function that verifies JSON Web Tokens
//(JWTs) to protect your API routes, ensuring only logged-in users can access 
//certain functionalities.


const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// IMPORTANT: This secret key should be a strong, random string and stored
// securely, ideally as an environment variable (process.env.JWT_SECRET)
// In development, we use a default, but change this for production!
const JWT_SECRET = process.env.JWT_SECRET ||'If hate is real, then the pain you feel is justified. As emotions assures your humanity.'; // Replace with a strong, random key!

/**
 * Middleware function to authenticate requests using JWT.
 * It checks for a token in the 'x-auth-token' header or 'Authorization' header (Bearer token).
 * If valid, it attaches the decoded user information to the request object.
 */
const auth = (req, res, next) => {
    // Option 1: Get token from 'x-auth-token' header (common in some tutorials)
    let token = req.header('x-auth-token');

    // Option 2: Get token from 'Authorization' header (Bearer token - more standard for React/frontend)
    if (!token && req.header('Authorization')) {
        const authHeader = req.header('Authorization');
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
        }
    }

    // Check if no token is provided
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the decoded user information (e.g., username) to the request object.
        // This makes user data available in subsequent route handlers.
        req.user = decoded.username; // Assuming your JWT payload has a 'username' field
        next(); // Call next() to pass control to the next middleware or route handler
    } catch (error) {
        // If token is invalid (e.g., expired, malformed, wrong secret)
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ message: 'Token is not valid or expired' });
    }
};

// Export the middleware so it can be used in server.js
module.exports = auth;