const bookingController = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/auth');

module.exports = (app) => {
    app.post('/reserve', authMiddleware.authenticateUser, bookingController.createBooking);
    app.get('/reservations', authMiddleware.authenticateUser, bookingController.getUserBookings);
    app.delete('/reservations/:id', authMiddleware.authenticateUser, bookingController.cancelBooking);
}
