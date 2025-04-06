const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isConnected = false;

async function connect() {
  if (isConnected) {
    return;
  }
  
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  isConnected = true;
}

async function clean() {
  if (!isConnected) {
    await connect();
  }
  
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

async function close() {
  if (!isConnected || !mongoose.connection.readyState) {
    return;
  }
  
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
  
  isConnected = false;
}

module.exports = {
  connect,
  clean,
  close,
  isConnected: () => isConnected
};