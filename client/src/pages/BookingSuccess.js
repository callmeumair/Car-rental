import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const paymentIntentId = searchParams.get('payment_intent');
        const bookingId = searchParams.get('booking_id');

        if (!paymentIntentId || !bookingId) {
          throw new Error('Invalid booking confirmation');
        }

        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        setError('Error fetching booking details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [location.search]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 60, mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your booking has been successfully processed. Here are your booking details:
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Booking Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Booking ID:</strong> {booking._id}
              </Typography>
              <Typography variant="body1">
                <strong>Car:</strong> {booking.car.make} {booking.car.model}
              </Typography>
              <Typography variant="body1">
                <strong>Pickup Date:</strong>{' '}
                {format(new Date(booking.startDate), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1">
                <strong>Return Date:</strong>{' '}
                {format(new Date(booking.endDate), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1">
                <strong>Pickup Location:</strong> {booking.pickupLocation}
              </Typography>
              <Typography variant="body1">
                <strong>Dropoff Location:</strong> {booking.dropoffLocation}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Total Amount:</strong> ${booking.totalAmount}
              </Typography>
              <Typography variant="body1">
                <strong>Payment Method:</strong> {booking.paymentMethod}
              </Typography>
              <Typography variant="body1">
                <strong>Payment Status:</strong> Paid
              </Typography>
              {booking.insurance && (
                <Typography variant="body1">
                  <strong>Insurance:</strong> {booking.insuranceType} (${booking.insuranceType === 'premium' ? '20' : '10'}/day)
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Next Steps
          </Typography>
          <Typography variant="body1" paragraph>
            1. You will receive a confirmation email with your booking details
          </Typography>
          <Typography variant="body1" paragraph>
            2. Please bring your driver's license and the credit card used for payment when picking up the car
          </Typography>
          <Typography variant="body1" paragraph>
            3. Arrive at the pickup location 15 minutes before your scheduled time
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingSuccess; 