import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn,
  CalendarToday,
  DirectionsCar,
} from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [searchParams, setSearchParams] = useState({
    location: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await axios.get('/api/cars', {
          params: { limit: 3, sort: 'rating' },
        });
        setFeaturedCars(response.data);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      }
    };

    fetchFeaturedCars();
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      location: searchParams.location,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    });
    navigate(`/cars?${queryParams.toString()}`);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Ride
          </Typography>
          <Typography variant="h5" gutterBottom>
            Choose from our wide selection of vehicles
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mt: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Location"
              value={searchParams.location}
              onChange={(e) =>
                setSearchParams({ ...searchParams, location: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type="date"
              value={searchParams.startDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, startDate: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type="date"
              value={searchParams.endDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, endDate: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ minWidth: 200 }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Featured Cars Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Cars
        </Typography>
        <Grid container spacing={4}>
          {featuredCars.map((car) => (
            <Grid item key={car._id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
                onClick={() => navigate(`/cars/${car._id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={car.image}
                  alt={car.make}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {car.make} {car.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {car.type} • {car.transmission} • {car.seats} seats
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    ${car.pricePerDay}/day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                Why Choose Us?
              </Typography>
              <Typography variant="body1" paragraph>
                We offer the best selection of vehicles at competitive prices.
                Our cars are well-maintained and regularly serviced to ensure
                your safety and comfort.
              </Typography>
              <Grid container spacing={2}>
                {[
                  '24/7 Customer Support',
                  'Flexible Rental Options',
                  'Competitive Prices',
                  'Wide Selection',
                ].map((feature) => (
                  <Grid item xs={6} key={feature}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/feature-image.jpg"
                alt="Car Rental Service"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 