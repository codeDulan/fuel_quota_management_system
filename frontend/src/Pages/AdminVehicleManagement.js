// src/pages/AdminVehicleManagement.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Avatar,
  TablePagination,
  Divider
} from '@mui/material';
import {
  DirectionsCar as VehicleIcon,
  TwoWheeler as MotorcycleIcon,
  LocalShipping as ThreeWheelerIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  LocalGasStation as FuelIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Engineering as EngineIcon
} from '@mui/icons-material';
import { VehicleService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils } from '../utils';

const AdminVehicleManagement = () => {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Statistics
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    cars: 0,
    motorcycles: 0,
    threeWheelers: 0,
    petrol: 0,
    diesel: 0
  });

  // Load vehicles
  useEffect(() => {
    loadVehicles();
  }, []);

  // Filter vehicles when search term or filters change
  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, typeFilter, fuelFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getAllVehicles();
      setVehicles(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      NotificationService.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vehicleList) => {
    const stats = {
      total: vehicleList.length,
      cars: vehicleList.filter(v => v.vehicleType === 'Car').length,
      motorcycles: vehicleList.filter(v => v.vehicleType === 'Motorcycle').length,
      threeWheelers: vehicleList.filter(v => v.vehicleType === 'Three Wheeler').length,
      petrol: vehicleList.filter(v => v.fuelType === 'Petrol').length,
      diesel: vehicleList.filter(v => v.fuelType === 'Diesel').length
    };
    setVehicleStats(stats);
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by vehicle type
    if (typeFilter) {
      filtered = filtered.filter(vehicle => vehicle.vehicleType === typeFilter);
    }

    // Filter by fuel type
    if (fuelFilter) {
      filtered = filtered.filter(vehicle => vehicle.fuelType === fuelFilter);
    }

    setFilteredVehicles(filtered);
  };

  const handleViewDetails = async (vehicle) => {
    try {
      // Get detailed vehicle info
      const response = await VehicleService.getVehicleById(vehicle.id);
      setSelectedVehicle(response.data);
      setDetailsDialogOpen(true);
    } catch (error) {
      NotificationService.error('Failed to load vehicle details');
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Car':
        return <VehicleIcon />;
      case 'Motorcycle':
        return <MotorcycleIcon />;
      case 'Three Wheeler':
        return <ThreeWheelerIcon />;
      default:
        return <VehicleIcon />;
    }
  };

  const getVehicleTypeColor = (type) => {
    switch (type) {
      case 'Car':
        return 'primary';
      case 'Motorcycle':
        return 'success';
      case 'Three Wheeler':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading vehicles...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Vehicle Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage registered vehicles in the system
          </Typography>
        </Box>
        <Tooltip title="Refresh Vehicles">
          <IconButton onClick={loadVehicles}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Vehicles
                  </Typography>
                  <Typography variant="h4">
                    {vehicleStats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <VehicleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Vehicles"
              placeholder="Search by registration, owner, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Vehicle Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Car">Cars</MenuItem>
                <MenuItem value="Motorcycle">Motorcycles</MenuItem>
                <MenuItem value="Three Wheeler">Three Wheelers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                label="Fuel Type"
              >
                <MenuItem value="">All Fuels</MenuItem>
                <MenuItem value="Petrol">Petrol</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setFuelFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicles Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Fuel</TableCell>
                <TableCell>Engine</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getVehicleTypeColor(vehicle.vehicleType) }}>
                        {getVehicleIcon(vehicle.vehicleType)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {vehicle.registrationNumber}
                        </Typography>
                        {vehicle.make && vehicle.model && (
                          <Typography variant="body2" color="text.secondary">
                            {vehicle.make} {vehicle.model} {vehicle.year}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.ownerName || 'N/A'}
                    </Typography>
                    {vehicle.ownerEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.ownerEmail}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={vehicle.vehicleType}
                      size="small"
                      color={getVehicleTypeColor(vehicle.vehicleType)}
                      icon={getVehicleIcon(vehicle.vehicleType)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={vehicle.fuelType}
                      size="small"
                      color={vehicle.fuelType === 'Petrol' ? 'success' : 'primary'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.engineCapacity}cc
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {vehicle.createdAt ? DateUtils.formatTimestamp(vehicle.createdAt) : 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(vehicle)}
                        color="primary"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredVehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Vehicle Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedVehicle && getVehicleIcon(selectedVehicle.vehicleType)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              Vehicle Details - {selectedVehicle?.registrationNumber}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VehicleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.registrationNumber}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QrCodeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle Type
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.vehicleType}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FuelIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fuel Type
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.fuelType}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EngineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Engine Capacity
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.engineCapacity}cc
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Vehicle Details */}
              {(selectedVehicle.make || selectedVehicle.model || selectedVehicle.year) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Vehicle Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {selectedVehicle.make && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Make
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVehicle.make}
                      </Typography>
                    </Grid>
                  )}

                  {selectedVehicle.model && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Model
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVehicle.model}
                      </Typography>
                    </Grid>
                  )}

                  {selectedVehicle.year && (
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Year
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedVehicle.year}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Owner Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Owner Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Owner Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.ownerName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Owner Email
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedVehicle.ownerEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Registration Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Registration Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Registration Date
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedVehicle.createdAt ? DateUtils.formatTimestamp(selectedVehicle.createdAt) : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedVehicle.status || 'Active'}
                  color="success"
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminVehicleManagement; 