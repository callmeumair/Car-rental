const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('car', 'pricePerDay');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate total amount in cents
    const amount = Math.round(booking.totalPrice * 100);

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle successful payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      // Update booking status
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      const failedBookingId = failedPaymentIntent.metadata.bookingId;

      // Update booking status
      await Booking.findByIdAndUpdate(failedBookingId, {
        paymentStatus: 'failed',
        status: 'pending',
      });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .select('totalPrice paymentStatus paymentMethod createdAt')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 