import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { format } from 'date-fns';

const steps = ['Personal Details', 'Booking Details', 'Payment'];

// Mock car data
const mockCar = {
  _id: '1',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  type: 'Sedan',
  transmission: 'Automatic',
  seats: 5,
  pricePerDay: 50,
  location: 'New York',
  image: 'https://example.com/car.jpg',
};

const Booking = () => {
  const { carId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    driverLicense: '',
    startDate: location.state?.startDate || '',
    endDate: location.state?.endDate || '',
    pickupLocation: '',
    dropoffLocation: '',
    insurance: false,
    insuranceType: 'none',
    paymentMethod: 'credit_card',
  });

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    let total = mockCar.pricePerDay * days;
    
    if (bookingData.insurance) {
      const insuranceCost = bookingData.insuranceType === 'premium' ? 20 : 10;
      total += insuranceCost * days;
    }
    
    return total;
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);
      
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      navigate('/booking-success', {
        state: {
          booking: {
            ...bookingData,
            car: mockCar,
            totalPrice: calculateTotalPrice(),
            status: 'confirmed',
            paymentStatus: 'paid',
          }
        }
      });
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Container sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={bookingData.firstName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={bookingData.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Driver's License Number"
                  name="driverLicense"
                  value={bookingData.driverLicense}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={bookingData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={bookingData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Pickup Location"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Dropoff Location"
                  name="dropoffLocation"
                  value={bookingData.dropoffLocation}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bookingData.insurance}
                      onChange={handleInputChange}
                      name="insurance"
                    />
                  }
                  label="Add Insurance"
                />
              </Grid>
              {bookingData.insurance && (
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Insurance Type</FormLabel>
                    <RadioGroup
                      name="insuranceType"
                      value={bookingData.insuranceType}
                      onChange={handleInputChange}
                    >
                      <FormControlLabel
                        value="basic"
                        control={<Radio />}
                        label="Basic ($10/day)"
                      />
                      <FormControlLabel
                        value="premium"
                        control={<Radio />}
                        label="Premium ($20/day)"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Typography variant="body1">
                  Car: {mockCar.make} {mockCar.model}
                </Typography>
                <Typography variant="body1">
                  Rental Period: {format(new Date(bookingData.startDate), 'MMM d, yyyy')} -{' '}
                  {format(new Date(bookingData.endDate), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="body1">
                  Base Price: ${mockCar.pricePerDay}/day
                </Typography>
                {bookingData.insurance && (
                  <Typography variant="body1">
                    Insurance: ${bookingData.insuranceType === 'premium' ? '20' : '10'}/day
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: ${totalPrice}
                </Typography>
              </CardContent>
            </Card>
            <form onSubmit={handlePaymentSubmit}>
              <PaymentElement />
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!stripe || loading}
                  fullWidth
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </Button>
              </Box>
            </form>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? null : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 &&
                  (!bookingData.firstName ||
                    !bookingData.lastName ||
                    !bookingData.email ||
                    !bookingData.phone ||
                    !bookingData.driverLicense)) ||
                (activeStep === 1 &&
                  (!bookingData.startDate ||
                    !bookingData.endDate ||
                    !bookingData.pickupLocation ||
                    !bookingData.dropoffLocation))
              }
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Booking; 