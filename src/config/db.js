const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongo = async () => {
  if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }
  
  const uri = process.env.MONGO_URI;
  logger.info('Connecting to MongoDB...');
  await mongoose.connect(uri);
  logger.info('MongoDB connection established successfully');
};

connectMongo();
