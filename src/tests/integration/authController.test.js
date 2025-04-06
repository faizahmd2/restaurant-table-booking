const { validUser, invalidUser } = require('../fixtures/users');
const request = require('supertest');
const app = require('../../../server');
const { clean } = require('../testDb');

describe('Auth Controller', () => {
    beforeAll(async () => {
            await clean();
        });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send(validUser);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        registerUser = res.body.user;
    });

    it('should login existing user and return token', async () => {
        const reg = await request(app)
            .post('/register')
            .send(validUser);

        const res = await request(app)
            .post('/token')
            .send({ email: validUser.email, password: validUser.password });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail login for unknown user', async () => {
        const res = await request(app)
            .post('/token')
            .send({ email: invalidUser.email, password: invalidUser.password });

        expect(res.statusCode).toBe(401);
    });

    it('should fail to register invalid user', async () => {
        const res = await request(app)
            .post('/register')
            .send(invalidUser);

        expect(res.statusCode).toBe(400);
    });
});