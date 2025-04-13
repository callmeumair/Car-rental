# Car Rental Application

A full-stack car rental application built with MERN stack (MongoDB, Express.js, React.js, Node.js) and Material-UI for the frontend.

## Features

- User authentication (register, login, profile management)
- Browse and search cars with filters
- Detailed car information and specifications
- Multi-step booking process
- Secure payment processing with Stripe
- Booking management (view, modify, cancel)
- Responsive design for all devices
- Admin dashboard for managing cars and bookings

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios
- Stripe Elements
- date-fns

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Stripe API
- bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account (for payment processing)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/car-rental.git
cd car-rental
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start the development servers:
```bash
# Start both client and server concurrently
npm run dev:full

# Or start them separately
# Terminal 1 (server)
npm run dev

# Terminal 2 (client)
npm run client
```

## Project Structure

```
car-rental/
├── client/                 # React frontend
│   ├── public/            # Static files
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main App component
│   └── package.json
├── models/                # MongoDB models
├── routes/                # Express routes
├── server.js             # Express server
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars with filters
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Add new car (admin only)
- `PUT /api/cars/:id` - Update car (admin only)
- `DELETE /api/cars/:id` - Delete car (admin only)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Handle Stripe webhooks
- `GET /api/payments/history` - Get payment history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the beautiful UI components
- Stripe for payment processing
- MongoDB for the database
- All contributors who have helped with this project 