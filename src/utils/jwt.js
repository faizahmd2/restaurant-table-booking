const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'testsecretkey';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

exports.verifyToken = (token) => jwt.verify(token, JWT_SECRET);

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};