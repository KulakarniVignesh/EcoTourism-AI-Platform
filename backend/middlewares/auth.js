const jwt = require('jsonwebtoken');

// 🔐 AUTH MIDDLEWARE (Verify Token)
const authMiddleware = (req, res, next) => {
  try {
    console.log(`[Auth] Path: ${req.originalUrl}`);
    // Use the core HTTP headers object for maximum stability
    const authHeader = req.headers ? (req.headers['authorization'] || req.headers['x-auth-token']) : null;

    // ❌ No token
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // ✅ Extract token (Bearer token)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // ❌ Invalid format
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // ✅ Attach user data (Check if result is nested inside 'user' property)
    req.user = decoded.user ? decoded.user : decoded;
    console.log('Decoded Token User:', req.user);

    next();

  } catch (err) {
    console.error('❌ Auth Error:', err.message);
    return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

// 🧭 GUIDE ROLE CHECK
const guideMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'guide' && req.user.user?.role !== 'guide')) {
    console.warn(`[Forbidden] Access denied for role: ${req.user?.role || 'unknown'}`);
    return res.status(403).json({ message: 'Access denied: Guide role required' });
  }
  next();
};

// 👤 USER ROLE CHECK
const userMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'user' && req.user.user?.role !== 'user')) {
    console.warn(`[Forbidden] Access denied for role: ${req.user?.role || 'unknown'}`);
    return res.status(403).json({ message: 'Access denied: User role required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  guideMiddleware,
  userMiddleware,
};