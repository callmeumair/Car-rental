const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
  },
  additionalRequests: String,
  insurance: {
    type: Boolean,
    default: false,
  },
  insuranceType: {
    type: String,
    enum: ['basic', 'premium', 'none'],
    default: 'none',
  },
  driverDetails: {
    name: String,
    age: Number,
    licenseNumber: String,
  },
}, {
  timestamps: true,
});

// Calculate total price before saving
bookingSchema.pre('save', async function(next) {
  if (!this.isModified('startDate') && !this.isModified('endDate')) return next();
  
  try {
    const Car = mongoose.model('Car');
    const car = await Car.findById(this.car);
    
    if (!car) {
      throw new Error('Car not found');
    }
    
    const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    this.totalPrice = car.pricePerDay * days;
    
    if (this.insurance) {
      const insuranceCost = this.insuranceType === 'premium' ? 20 : 10;
      this.totalPrice += insuranceCost * days;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Booking', bookingSchema); 