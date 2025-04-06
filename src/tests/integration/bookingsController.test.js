const request = require('supertest');
const app = require('../../../server');
const { validUserBooking } = require('../fixtures/users');
const Restaurant = require('../../models/Restaurant');
const restaurants = require('../fixtures/restaurants.json');

describe('Bookings Controller', () => {
    test('should create a booking', async () => {
        const restaurant = await Restaurant.create(restaurants[0]);
        const table = restaurant.tables[0];
        const guestCount = table.capacity;

        const reg = await request(app)
            .post('/register')
            .send(validUserBooking);

        const user = reg.body.user;
        const token = reg.body.accessToken;

        let bookingTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

        const createPayload = {
            userId: user.id,
            restaurantId: restaurant._id,
            bookingTime: bookingTime,
            guestCount,
            tableId: table.tableId
        };

        const res = await request(app)
            .post('/reserve')
            .set('Authorization', `Bearer ${token}`)
            .send(createPayload);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('confirmationCode');
        bookingId = res.body.id;
    });
});

