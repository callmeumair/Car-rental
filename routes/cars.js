const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Booking = require('../models/Booking');

// Get all cars with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      location,
      startDate,
      endDate,
      seats,
    } = req.query;

    let query = {};

    // Apply filters
    if (type) query.type = type;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (location) query.location = location;
    if (seats) query.seats = { $gte: seats };
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = minPrice;
      if (maxPrice) query.pricePerDay.$lte = maxPrice;
    }

    // Check availability for specific dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookedCars = await Booking.find({
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
          { startDate: { $gte: start, $lte: end } },
        ],
        status: { $ne: 'cancelled' },
      }).distinct('car');

      query._id = { $nin: bookedCars };
    }

    const cars = await Car.find(query)
      .populate('reviews.user', 'name')
      .sort({ pricePerDay: 1 });

    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('reviews.user', 'name');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new car (admin only)
router.post('/', async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update car (admin only)
router.put('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete car (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to car
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const review = {
      user: userId,
      rating,
      comment,
    };

    car.reviews.push(review);

    // Update average rating
    const totalRating = car.reviews.reduce((sum, review) => sum + review.rating, 0);
    car.rating = totalRating / car.reviews.length;

    await car.save();
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 