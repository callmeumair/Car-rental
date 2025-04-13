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
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { format } from 'date-fns';

const steps = ['Personal Details', 'Booking Details', 'Payment'];

const Booking = () => {
  const { carId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [activeStep, setActiveStep] = useState(0);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`/api/cars/${carId}`);
        setCar(response.data);
        setBookingData((prev) => ({
          ...prev,
          pickupLocation: response.data.location,
          dropoffLocation: response.data.location,
        }));
      } catch (error) {
        setError('Error fetching car details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

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
      // First create the booking
      const bookingResponse = await axios.post('/api/bookings', {
        car: carId,
        ...bookingData,
      });

      // Then create payment intent with the booking ID
      const paymentResponse = await axios.post('/api/payments/create-payment-intent', {
        bookingId: bookingResponse.data._id,
      });

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success?booking_id=${bookingResponse.data._id}`,
        },
      });

      if (confirmError) {
        setError(confirmError.message);
      }
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      const response = await axios.post('/api/bookings', {
        car: carId,
        ...bookingData,
      });
      setBookingData((prev) => ({ ...prev, _id: response.data._id }));
      handleNext();
    } catch (error) {
      setError('Error creating booking');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !car) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Car not found'}</Alert>
      </Container>
    );
  }

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
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">
                Car: {car.make} {car.model}
              </Typography>
              <Typography variant="body1">
                Rental Period: {format(new Date(bookingData.startDate), 'MMM d, yyyy')} -{' '}
                {format(new Date(bookingData.endDate), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1">
                Base Price: ${car.pricePerDay}/day
              </Typography>
              {bookingData.insurance && (
                <Typography variant="body1">
                  Insurance: ${bookingData.insuranceType === 'premium' ? '20' : '10'}/day
                </Typography>
              )}
            </Box>
            <form onSubmit={handlePaymentSubmit}>
              <PaymentElement />
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!stripe}
                  fullWidth
                >
                  Pay Now
                </Button>
              </Box>
            </form>
          </Box>
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
              onClick={activeStep === 1 ? handleBookingSubmit : handleNext}
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
              {activeStep === 1 ? 'Proceed to Payment' : 'Next'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Booking; 