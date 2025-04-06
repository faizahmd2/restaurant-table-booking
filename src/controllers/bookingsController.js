const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const moment = require('moment');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

exports.createBooking = async (req, res) => {
    try {
        let validate = await helper.createBookingPayloadValidation(req.body);
        if (validate.error) {
            logger.error('Booking validation failed', validate);
            return res.status(400).json({ message: validate.error })
        }

        const { restaurantId, tableId, guestCount, bookingTime } = validate.data;
        const userId = req.user.id;
        logger.info('Creating new booking', { userId, restaurantId, tableId, guestCount, bookingTime });

        let randomCode = Math.floor(Math.random() * 10000);

        const booking = new Booking({
            userId,
            restaurantId,
            tableId,
            bookingTime: new Date(bookingTime),
            guestCount,
            confirmationCode: randomCode,
            status: 'confirmed'
        });
        
        const savedBooking = await booking.save();
        
        res.status(201).json({ message: "Booking created successfully", id: savedBooking._id, confirmationCode: randomCode });

        let restaurant = validate.restaurant;
        let table = validate.table;

        let bookingTimeFormatted = moment(booking.bookingTime).format('hh:mm A');
        let bookingDateFormatted = moment(booking.bookingTime).format('DD MMMM YYYY');

        let msg = `Hi, your booking at ${restaurant.name} on table(${table.tableId}) for ${guestCount} guests is confirmed for ${bookingDateFormatted} at ${bookingTimeFormatted}. Your confirmation code is ${randomCode}.`;

        User.findById(userId).then(user => {
            let options = { referenceType: 'reservation', referenceId: savedBooking._id.toString() };
            if (user.email) {
                notificationService.sendEmail(user.email, 'Booking Confirmation', msg, options);
            }
            if (user.phone) {
                notificationService.sendSMS(user.phone, msg, options);
            }
        });
    } catch (error) {
        logger.error('Booking creation failed', error);
        res.status(500).json({ message: 'Failed to book table' });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.find({ userId })
            .populate('userId', 'name email phone')
            .sort({ bookingDate: -1 })
            .populate('restaurantId', 'name address cuisineType tables')
            .lean();

        let finalBookings = bookings.map(booking => {
            let bookingTime = moment(booking.bookingTime).format('hh:mm A');
            let bookingDate = moment(booking.bookingTime).format('DD MMMM YYYY');

            let restaurant = booking.restaurantId;
            let table = restaurant.tables.find(t => t.tableId === booking.tableId);
            return {
                id: booking._id,
                guestCount: booking.guestCount,
                confirmationCode: booking.confirmationCode,
                restaurantName: restaurant.name,
                restaurantAddress: restaurant.address,
                tableId: table.tableId,
                tableCapacity: table.capacity,
                bookingTime,
                bookingDate
            };
        }
        );

        res.json({ bookings: finalBookings });
    } catch (error) {
        logger.error('Failed to fetch bookings', error);
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id: bookingId } = req.params;
        const userId = req.user.id;
        logger.info('Canceling booking Request', { userId, bookingId });
        const booking = await Booking.findOne({ _id: bookingId, userId });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'canceled') {
            return res.status(400).json({ message: 'Booking is already canceled' });
        }

        booking.status = 'canceled';
        await booking.save();

        res.json({ message: 'Booking canceled successfully' });
    } catch (error) {
        logger.error('Cancel booking failed', error);
        res.status(500).json({ message: 'Cancel failed', error: error.message });
    }
};

var helper = {
    createBookingPayloadValidation: async function (body) {
        const { restaurantId, tableId, guestCount, bookingTime } = body;
        if (!restaurantId || !tableId || !guestCount || !bookingTime) {
            return { error: 'Missing required fields' };
        }

        if (isNaN(guestCount) || guestCount < 1) {
            return { error: 'Guest count must be a positive number' };
        }

        const currTime = new Date();
        const bookingDate = new Date(bookingTime);
        if (bookingDate < currTime) return { error: 'Booking time must be in the future' };

        const restaurant = await Restaurant.findOne({ _id: restaurantId, status: 1 });
        if (!restaurant) return { error: 'Restaurant not found' };

        let table = restaurant.tables.find(t => t.tableId === tableId);
        if (!table) return { error: 'Table not found' };

        if (table.capacity < guestCount) return { error: 'Guest count exceeds table capacity' };

        let momentFormat = moment(bookingTime);
        let startTime = momentFormat.subtract(2, 'hours');
        let endTime = momentFormat.add(2, 'hours');
        let bookings = await Booking.find({
            restaurantId,
            tableId,
            bookingTime: {
                $gte: startTime.toDate(),
                $lte: endTime.toDate()
            },
            status: { $ne: 'canceled' }
        });
        if (bookings.length > 0) return { error: 'Table is not available' };

        return { data: body, table, restaurant };
    }
}