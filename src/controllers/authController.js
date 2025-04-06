const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email, status: 1 });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const accessToken = generateToken(user);
    
    res.json({
      user: {
        email: user.email
      },
      accessToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    logger.info('Registering user request:', { email, name, phone });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email or password is missing' });
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    // if phone is provided, validate it
    if(phone && (isNaN(phone) || (phone + "").length !== 10)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    
    const existingUser = await User.findOne({ where: { email, status: 1 } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
        email,
        password: hashedPassword,
        status: 1,
        name: name || null,
        phone: phone || null,
        role: 'customer'
    });
    
    const accessToken = generateToken(user);
    
    res.status(201).json({
      user: {
        email: user.email
      },
      accessToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginUser,
  registerUser
};