const dotenv = require('dotenv');
dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');
const loadRoutes = require('./src/routes');
const logger = require('./src/utils/logger');

logger.info(`Environment: ${process.env.NODE_ENV}`);

global.appRoot = path.resolve(__dirname);

const app = express();

app.use(helmet());
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    '-', 
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
}, { stream: logger.stream }));

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24hrs
};

app.use(cors(corsOptions));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

loadRoutes(app);

logger.info('✓ All routes loaded');

// start database connection
require('./src/config/db');

app.get('/', (req, res) => {
    res.send('Booking App service is running');
});

app.all(/(.*)/, (req, res) => {
    res.status(404).json({ error: 'Invalid path' });
});

// Start server
const PORT = process.env.PORT || 2900;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
