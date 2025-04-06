const request = require('supertest');
const app = require('../../../server');
const Restaurant = require('../../models/Restaurant');
const restaurants = require('../fixtures/restaurants.json');
const { clean } = require('../testDb');

describe('Restaurants Controller', () => {
  beforeAll(async () => {
    await clean();
  });

  it('should return an empty list initially', async () => {
    const res = await request(app).get('/restaurants');
    expect(res.statusCode).toBe(200);
    expect(res.body.restaurants).toHaveLength(0);
  });

  it('should return created restaurants', async () => {
    await Restaurant.insertMany(restaurants);
    const res = await request(app).get('/restaurants');
    expect(res.statusCode).toBe(200);
    expect(res.body.restaurants).toHaveLength(2);
  });
});