const Booking = require('../models/Booking');
const notificationService = require('../services/notificationService');
const moment = require('moment');

const SEND_REMINDERS_INTERVAL = 30 * 60 * 1000; // 30 minutes

const sendUpcomingReminders = async () => {
    const now = new Date();
    const future = new Date(now.getTime() + SEND_REMINDERS_INTERVAL);

    const bookings = await Booking.find({
        bookingTime: { $gte: now, $lte: future },
        status: 'confirmed'
    })
        .populate('userId', 'name email phone')
        .sort({ bookingDate: -1 })
        .populate('restaurantId', 'name address cuisineType tables')
        .lean();

    let mapBooking = bookings.map(booking => {
        let bookingTime = moment(booking.bookingTime).format('hh:mm A');
        let bookingDate = moment(booking.bookingTime).format('DD MMMM YYYY');
        let restaurant = booking.restaurantId;
        let table = restaurant.tables.find(t => t.tableId === booking.tableId);

        return {
            id: booking._id,
            restaurant: restaurant.name,
            tableId: table.tableId,
            guestCount: booking.guestCount,
            bookingTime: bookingTime,
            bookingDate: bookingDate,
            confirmationCode: booking.confirmationCode,
            user: booking.userId
        };
    });

    for (const booking of mapBooking) {
        if(!booking.user) continue;

        let options = { referenceType: 'reminder', referenceId: booking.id.toString() };

        let msg = `Hi ${booking.user.name ? booking.user.name : "Sir"}, This is a reminder for your booking at ${booking.restaurant} on table(${booking.tableId}) for ${booking.guestCount} guests on ${booking.bookingDate} at ${booking.bookingTime}. Your confirmation code is ${booking.confirmationCode}.`;
        if (booking.user.email) {
            notificationService.sendEmail(booking.user.email, 'Upcoming Booking Reminder', msg, options);
        }
        if (booking.user.phone) {
            notificationService.sendSMS(booking.user.phone, msg, options);
        }
    }
};

module.exports = { sendUpcomingReminders };