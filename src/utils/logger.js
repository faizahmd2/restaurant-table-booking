const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : process.env.NODE_ENV === 'test' ? 'silent' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'restaurant-booking-app' },
  transports: [
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // new winston.transports.Console({
    //   format: winston.format.combine(
    //     winston.format.colorize(),
    //     winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    //       return `${timestamp} ${level} [${service}]: ${message} ${
    //         Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    //       }`;
    //     })
    //   ),
    // }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // const emojis = {
          //   info: 'ℹ️',
          //   warn: '⚠️',
          //   error: '❌',
          //   debug: '🐞',
          //   http: '🌐'
          // };
          // const emoji = emojis[level] || '';
          // const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta, null, 2) : '';
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),    
  ],

  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],

  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ],
  exitOnError: false
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = {
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  http: (message, meta = {}) => {
    logger.http(message, meta);
  },
  stream: logger.stream
};