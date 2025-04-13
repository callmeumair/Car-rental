import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Slider,
  Button,
  Paper,
  Chip,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn,
  CalendarToday,
  FilterList,
} from '@mui/icons-material';
import axios from 'axios';

const CarList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    type: '',
    transmission: '',
    fuelType: '',
    minPrice: 0,
    maxPrice: 500,
    seats: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cars', {
          params: {
            ...filters,
            page,
            limit: 9,
          },
        });
        setCars(response.data.cars);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, page]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      ...filters,
      page: 1,
    });
    navigate(`/cars?${queryParams.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      location: '',
      startDate: '',
      endDate: '',
      type: '',
      transmission: '',
      fuelType: '',
      minPrice: 0,
      maxPrice: 500,
      seats: '',
    });
    setPage(1);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              <FilterList sx={{ mr: 1 }} />
              Filters
            </Typography>

            <TextField
              fullWidth
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              margin="normal"
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
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              select
              label="Car Type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              margin="normal"
            >
              {['Sedan', 'SUV', 'Truck', 'Luxury', 'Sports'].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Transmission"
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              margin="normal"
            >
              {['Automatic', 'Manual'].map((transmission) => (
                <MenuItem key={transmission} value={transmission}>
                  {transmission}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Fuel Type"
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              margin="normal"
            >
              {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((fuelType) => (
                <MenuItem key={fuelType} value={fuelType}>
                  {fuelType}
                </MenuItem>
              ))}
            </TextField>

            <Typography gutterBottom sx={{ mt: 2 }}>
              Price Range
            </Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={(_, newValue) => {
                handleFilterChange('minPrice', newValue[0]);
                handleFilterChange('maxPrice', newValue[1]);
              }}
              valueLabelDisplay="auto"
              min={0}
              max={500}
              step={10}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSearch}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
              <Button variant="outlined" fullWidth onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Cars Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : cars.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>No cars found matching your criteria</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {cars.map((car) => (
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
                        <Typography gutterBottom variant="h6" component="h3">
                          {car.make} {car.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {car.type} • {car.transmission} • {car.seats} seats
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={`$${car.pricePerDay}/day`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={car.fuelType}
                            color="secondary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CarList; 