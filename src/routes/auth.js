const authController = require("../controllers/authController");

module.exports = (app) => {
    app.post("/token", authController.loginUser);
    app.post("/register", authController.registerUser);
}
