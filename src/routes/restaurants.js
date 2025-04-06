const restaurantsController = require("../controllers/restaurantsController");

module.exports = (app) => {
    app.get("/restaurants", restaurantsController.getRestaurants);
}
