import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify JWT access token from Authorization header or cookies.
 * Attaches user object to req.user.
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Fallback to cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Optional auth — attaches user if token exists, but doesn't block if not.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently continue without auth
  }
  next();
};
