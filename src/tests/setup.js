const testDb = require('./testDb');

// Connect to the in-memory database before all tests run
beforeAll(async () => {
  await testDb.connect();
});

afterEach(async () => {
  await testDb.clean();
});

afterAll(async () => {
  await testDb.close();
});

// Optional: Set timeout for all tests
jest.setTimeout(30000);