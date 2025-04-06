const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

var authMiddleware = {
    authenticateUser: (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
      }
      
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        logger.error('Token verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
    }
}

module.exports = authMiddleware;