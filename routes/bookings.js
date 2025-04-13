const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      car,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      paymentMethod,
      insurance,
      insuranceType,
      driverDetails,
      additionalRequests,
    } = req.body;

    // Check car availability
    const existingBooking = await Booking.findOne({
      car,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
        { startDate: { $gte: startDate, $lte: endDate } },
      ],
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Car is not available for the selected dates' });
    }

    // Create new booking
    const booking = new Booking({
      user: req.user.id,
      car,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      paymentMethod,
      insurance,
      insuranceType,
      driverDetails,
      additionalRequests,
    });

    await booking.save();

    // Update car availability
    await Car.findByIdAndUpdate(car, { available: false });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('car', 'make model year image pricePerDay')
      .sort({ startDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'make model year image pricePerDay')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to update this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking can be updated
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update completed or cancelled booking' });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('car', 'make model year image pricePerDay');

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel completed or cancelled booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update car availability
    await Car.findByIdAndUpdate(booking.car, { available: true });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 