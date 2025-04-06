
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');

var controllers = {
    getRestaurants: async (req, res) => {
        try {
            let { page, limit, search } = req.query;
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;

            const query = { status: 1 };
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const totalRestaurants = await Restaurant.countDocuments(query);
            const totalPages = Math.ceil(totalRestaurants / limit);
            const restaurants = await Restaurant.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ created: -1 });


            let finalRestaurants = restaurants.map(restaurant => {
                let tables = restaurant.tables.filter(table => table.status === 1);

                return {
                    id: restaurant._id,
                    name: restaurant.name,
                    address: restaurant.address,
                    cuisineType: restaurant.cuisineType,
                    tables: tables,
                    capacity: restaurant.capacity
                };
            }
            );

            res.json({
                page,
                limit,
                totalPages,
                totalRestaurants,
                restaurants: finalRestaurants
            });
        } catch (error) {
            logger.error('Error fetching restaurants:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = controllers;