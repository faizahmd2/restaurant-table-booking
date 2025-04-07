# 🍽️ Restaurant Table Booking Backend

This is the backend for a Restaurant Table Booking system where users can sign up, log in, browse restaurants, and book or cancel table reservations. The project includes authentication, email/SMS notifications, and reservation management features.

🔗 **Live Demo:** [https://restaurant-table-booking-ivsv.onrender.com](https://restaurant-table-booking-ivsv.onrender.com)


---

## 🚀 Features

- User Registration & JWT-based Authentication
- Browse & Search Restaurants
- Table Booking System
- Reservation History and Cancellation
- Email & SMS Notification Support

---

## 🧰 Tech Stack

- **Backend:** Node.js (Express)
- **Database:** MongoDB
- **Notifications:** SendGrid, Twilio, Nodemailer

---

## 🛠️ Setup Instructions

### ⚙️ Prerequisites

- Node.js `>= 18`
- MongoDB URI (local or cloud)

### 📦 Installation

```bash
git clone https://github.com/faizahmd2/restaurant-table-booking.git
cd restaurant-table-booking
npm install
```

### 🔐 Environment Variables

Create a .env.development file in the root directory:
```bash
NODE_ENV=development
PORT=2900

# JWT Auth
JWT_SECRET=s3cret
JWT_EXPIRY=24h

# MongoDB
MONGO_URI=<your-mongodb-uri>

# Twilio (Optional for SMS)
TWILIO_ACCOUNT_SID=<twilio-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_PHONE_NUMBER=<twilio-phone>

# SendGrid (Optional for Email)
SENDGRID_API_KEY=<sendgrid-api-key>
SENDGRID_FROM_EMAIL=<from-email>

# Nodemailer Gmail (Optional for Email)
GMAIL_USER=<your-gmail>
GMAIL_APP_PASSWORD=<your-app-password>

# Limits
DAILY_SMS_LIMIT=50
DAILY_EMAIL_LIMIT=50
```

### 📝 Notes:

*   `MONGO_URI` is **required** to connect to MongoDB.
    
*   **Email Options:**
    
    *   The app uses **Nodemailer with Gmail** as default. Provide `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
        
    *   Optionally, use **SendGrid** by supplying its credentials.
        
    *   You can skip both if email functionality is not needed.
        
*   **SMS (Twilio)** is optional. If SMS is not required, you may skip Twilio environment variables.

### ▶️ Running the App

Start the development server:

```bash
npm run dev
``` 

By default, the server runs on:  
📍 `http://localhost:2900`

---

📫 API Documentation
--------------------

API endpoints include:

*   `POST /register` – Create a new user
    
*   `POST /token` – Get JWT token
    
*   `GET /restaurants` – List restaurants
    
*   `POST /reserve` – Book a table (auth required)
    
*   `GET /reservations` – View reservations (auth required)
    
*   `DELETE /reservations/:id` – Cancel reservation (auth required)
    

Include the JWT token in the `Authorization` header as:  
`Bearer `
