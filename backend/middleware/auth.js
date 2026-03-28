const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization Denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check role if specified
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Access denied for this role' });
      }

      next();
    } catch (err) {
      console.error('JWT Error:', err.message);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

module.exports = authMiddleware;
