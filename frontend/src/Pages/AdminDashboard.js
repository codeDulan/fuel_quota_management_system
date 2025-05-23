// src/pages/AdminDashboard.js (Real Data Implementation)
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  LocalGasStation as StationIcon,
  DirectionsCar as VehicleIcon,
  People as PeopleIcon,
  BarChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdminService, FuelStationService, VehicleService } from '../services/ApiService';
import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';
import { FormatUtils, DateUtils } from '../utils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentStations, setRecentStations] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load main dashboard data
      const dashboardResponse = await AdminService.getAdminDashboard();
      setDashboardData(dashboardResponse.data);

      // Load recent stations (all stations, then sort by creation date)
      const stationsResponse = await FuelStationService.getAllStations();
      const allStations = stationsResponse.data;
      
      // Sort by creation date and take last 5
      const recentStationsList = allStations
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(station => ({
          id: station.id,
          name: station.name,
          owner: station.ownerName,
          registrationNumber: station.registrationNumber,
          status: station.isActive ? 'Active' : 'Inactive',
          createdAt: station.createdAt ? DateUtils.formatTimestamp(station.createdAt) : 'N/A'
        }));
      setRecentStations(recentStationsList);

      // Load recent vehicles (all vehicles, then sort by creation date)
      const vehiclesResponse = await VehicleService.getAllVehicles();
      const allVehicles = vehiclesResponse.data;
      
      // Sort by creation date and take last 5
      const recentVehiclesList = allVehicles
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(vehicle => ({
          id: vehicle.id,
          registrationNumber: vehicle.registrationNumber,
          owner: vehicle.ownerName,
          vehicleType: vehicle.vehicleType,
          fuelType: vehicle.fuelType,
          status: 'Approved', // Assuming all loaded vehicles are approved
          createdAt: vehicle.createdAt ? DateUtils.formatTimestamp(vehicle.createdAt) : 'N/A'
        }));
      setRecentVehicles(recentVehiclesList);

      // Load system health
      const healthResponse = await AdminService.getSystemHealth();
      setSystemHealth(healthResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      NotificationService.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    NotificationService.success('Dashboard refreshed!');
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading admin dashboard...
        </Typography>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage the fuel quota system
          </Typography>
        </Box>
        <Tooltip title="Refresh Dashboard">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* System Health Alert */}
      {systemHealth && !systemHealth.overallHealth && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ⚠️ System health issues detected. Please check system status below.
          </Typography>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData?.totalVehicleOwners || 0} Vehicle Owners, {dashboardData?.totalStationOwners || 0} Station Owners
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Vehicles */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Vehicles
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.totalVehicles || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData?.totalCars || 0} Cars, {dashboardData?.totalMotorcycles || 0} Motorcycles, {dashboardData?.totalThreeWheelers || 0} Three Wheelers
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <VehicleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Fuel Stations */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Fuel Stations
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.totalStations || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData?.activeStations || 0} Active, {dashboardData?.inactiveStations || 0} Inactive
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <StationIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Transactions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Today's Transactions
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData?.todayTransactionCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {FormatUtils.formatFuelAmount(dashboardData?.todayTotalDispensed || 0)} dispensed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fuel Distribution Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fuel Distribution Overview
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {dashboardData?.totalTransactionCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="success.main" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.totalPetrolDispensed || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Petrol Dispensed
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="info.main" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.totalDieselDispensed || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Diesel Dispensed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="warning.main" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.totalFuelDispensed || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Fuel Dispensed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<ChartIcon />}
                onClick={() => navigate('/admin/reports')}
              >
                View Detailed Reports
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ReportIcon />}
                onClick={() => navigate('/admin/analytics')}
              >
                System Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quota Utilization Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Month Quota Utilization
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.currentMonthAllocated || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Allocated
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="warning.main" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.currentMonthUsed || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Used This Month
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h5" color="success.main" gutterBottom>
                    {FormatUtils.formatFuelAmount(dashboardData?.currentMonthRemaining || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Utilization Rate</Typography>
                    <Typography variant="body2">{FormatUtils.formatPercentage(dashboardData?.utilizationPercentage || 0)}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(dashboardData?.utilizationPercentage || 0, 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      (dashboardData?.utilizationPercentage || 0) > 80 ? 'error' :
                      (dashboardData?.utilizationPercentage || 0) > 60 ? 'warning' : 'success'
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* System Health Status */}
      {systemHealth && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Health Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    {systemHealth.overallHealth ? (
                      <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                      <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Overall Health
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {systemHealth.overallHealth ? 'Good' : 'Issues Detected'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    {systemHealth.databaseConnected ? (
                      <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                      <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Database
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {systemHealth.databaseConnected ? 'Connected' : 'Disconnected'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <InfoIcon sx={{ color: 'info.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {systemHealth.activeUsers || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    {(systemHealth.totalErrors24h || 0) > 0 ? (
                      <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                    ) : (
                      <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Errors (24h)
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {systemHealth.totalErrors24h || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Recent Registrations */}
      <Grid container spacing={3}>
        {/* Recent Stations */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Station Registrations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentStations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent station registrations
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Registration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStations.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {station.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Owner: {station.owner}
                          </Typography>
                        </TableCell>
                        <TableCell>{station.registrationNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            label={station.status}
                            size="small"
                            color={station.status === 'Active' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {station.createdAt}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button size="small" onClick={() => navigate('/admin/stations')}>
                View All Stations
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Vehicles */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Vehicle Registrations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentVehicles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent vehicle registrations
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Registration</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Fuel</TableCell>
                      <TableCell>Owner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {vehicle.registrationNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{vehicle.vehicleType}</TableCell>
                        <TableCell>
                          <Chip 
                            label={vehicle.fuelType}
                            size="small"
                            color={vehicle.fuelType === 'Petrol' ? 'success' : 'primary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {vehicle.owner}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button size="small" onClick={() => navigate('/admin/vehicles')}>
                View All Vehicles
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Access */}
      <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Access
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List component="nav">
              <ListItem button onClick={() => navigate('/admin/users')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="User Management" secondary="Manage user accounts and roles" />
              </ListItem>
              <ListItem button onClick={() => navigate('/admin/vehicles')}>
                <ListItemIcon>
                  <VehicleIcon />
                </ListItemIcon>
                <ListItemText primary="Vehicle Management" secondary="View and manage registered vehicles" />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List component="nav">
              <ListItem button onClick={() => navigate('/admin/stations')}>
                <ListItemIcon>
                  <StationIcon />
                </ListItemIcon>
                <ListItemText primary="Station Management" secondary="Monitor fuel station operations" />
              </ListItem>
              <ListItem button onClick={() => navigate('/admin/reports')}>
                <ListItemIcon>
                  <ChartIcon />
                </ListItemIcon>
                <ListItemText primary="Reports & Analytics" secondary="Generate system reports" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

// CSS for refresh animation
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AdminDashboard;      
