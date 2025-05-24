// src/pages/AdminStationManagement.js
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
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  LocalGasStation as StationIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ToggleOn as ActivateIcon,
  ToggleOff as DeactivateIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { FuelStationService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils } from '../utils';

const AdminStationManagement = () => {
  // State management
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Statistics
  const [stationStats, setStationStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    petrolStations: 0,
    dieselStations: 0,
    fullService: 0
  });

  // Load stations
  useEffect(() => {
    loadStations();
  }, []);

  // Filter stations when search term or filters change
  useEffect(() => {
    filterStations();
  }, [stations, searchTerm, statusFilter, fuelFilter]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await FuelStationService.getAllStations();
      setStations(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error loading stations:', error);
      NotificationService.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (stationList) => {
    const stats = {
      total: stationList.length,
      active: stationList.filter(s => s.isActive).length,
      inactive: stationList.filter(s => !s.isActive).length,
      petrolStations: stationList.filter(s => s.hasPetrol).length,
      dieselStations: stationList.filter(s => s.hasDiesel).length,
      fullService: stationList.filter(s => s.hasPetrol && s.hasDiesel).length
    };
    setStationStats(stats);
  };

  const filterStations = () => {
    let filtered = [...stations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(station => station.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(station => !station.isActive);
    }

    // Filter by fuel type
    if (fuelFilter === 'petrol') {
      filtered = filtered.filter(station => station.hasPetrol);
    } else if (fuelFilter === 'diesel') {
      filtered = filtered.filter(station => station.hasDiesel);
    } else if (fuelFilter === 'both') {
      filtered = filtered.filter(station => station.hasPetrol && station.hasDiesel);
    }

    setFilteredStations(filtered);
  };

  const handleViewDetails = (station) => {
    setSelectedStation(station);
    setDetailsDialogOpen(true);
  };

  const handleToggleStationStatus = async (stationId, currentStatus) => {
    try {
      await FuelStationService.updateStationStatus(stationId, !currentStatus);
      NotificationService.success(`Station ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      loadStations(); // Reload stations
    } catch (error) {
      NotificationService.error('Failed to update station status');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <ActiveIcon /> : <InactiveIcon />;
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
          Loading stations...
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
            Station Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage fuel stations across the system
          </Typography>
        </Box>
        <Tooltip title="Refresh Stations">
          <IconButton onClick={loadStations}>
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
                    Total Stations
                  </Typography>
                  <Typography variant="h4">
                    {stationStats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <StationIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stationStats.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ActiveIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Inactive
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stationStats.inactive}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <InactiveIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Petrol
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stationStats.petrolStations}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <StationIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Diesel
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stationStats.dieselStations}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <StationIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Full Service
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stationStats.fullService}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <BusinessIcon />
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
              label="Search Stations"
              placeholder="Search by name, registration, city, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Stations</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
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
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="petrol">Petrol Only</MenuItem>
                <MenuItem value="diesel">Diesel Only</MenuItem>
                <MenuItem value="both">Both Fuels</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setFuelFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stations Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Station</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Fuel Types</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((station) => (
                <TableRow key={station.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getStatusColor(station.isActive) }}>
                        <StationIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {station.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {station.registrationNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {station.ownerName}
                    </Typography>
                    {station.ownerEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {station.ownerEmail}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {station.city}
                    </Typography>
                    {station.address && (
                      <Typography variant="body2" color="text.secondary">
                        {station.address}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {station.hasPetrol && (
                        <Chip label="Petrol" size="small" color="success" />
                      )}
                      {station.hasDiesel && (
                        <Chip label="Diesel" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={station.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(station.isActive)}
                      size="small"
                      icon={getStatusIcon(station.isActive)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {station.createdAt ? DateUtils.formatTimestamp(station.createdAt) : 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(station)}
                          color="primary"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={station.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStationStatus(station.id, station.isActive)}
                          color={station.isActive ? 'error' : 'success'}
                        >
                          {station.isActive ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredStations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Station Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StationIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Station Details - {selectedStation?.name}
              </Typography>
            </Box>
            <Chip
              label={selectedStation?.isActive ? 'Active' : 'Inactive'}
              color={getStatusColor(selectedStation?.isActive)}
              icon={getStatusIcon(selectedStation?.isActive)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStation && (
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
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Station Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedStation.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedStation.registrationNumber}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Location Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Location Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      City
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedStation.city}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedStation.contactNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedStation.address || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Fuel Services */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Fuel Services
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={<Switch checked={selectedStation.hasPetrol} disabled />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StationIcon sx={{ mr: 1, color: 'success.main' }} />
                        Petrol Service
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={<Switch checked={selectedStation.hasDiesel} disabled />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        Diesel Service
                      </Box>
                    }
                  />
                </Box>
              </Grid>

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
                      {selectedStation.ownerName}
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
                      {selectedStation.ownerEmail}
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
                  {selectedStation.createdAt ? DateUtils.formatTimestamp(selectedStation.createdAt) : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Current Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedStation.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(selectedStation.isActive)}
                    icon={getStatusIcon(selectedStation.isActive)}
                  />
                </Box>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant={selectedStation.isActive ? "outlined" : "contained"}
                    color={selectedStation.isActive ? "error" : "success"}
                    onClick={() => {
                      handleToggleStationStatus(selectedStation.id, selectedStation.isActive);
                      setDetailsDialogOpen(false);
                    }}
                    startIcon={selectedStation.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                  >
                    {selectedStation.isActive ? 'Deactivate Station' : 'Activate Station'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Navigate to station dashboard with this station's data
                      window.open(`/station/${selectedStation.id}/dashboard`, '_blank');
                    }}
                    startIcon={<BusinessIcon />}
                  >
                    View Dashboard
                  </Button>
                </Box>
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

export default AdminStationManagement;