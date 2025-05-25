// src/pages/StationTransactionHistory.js
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
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  History as HistoryIcon,
  LocalGasStation as FuelIcon,
  DirectionsCar as VehicleIcon,
  Business as StationIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ArrowBack as BackIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FuelQuotaService, FuelStationService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils, DownloadUtils } from '../utils';

const StationTransactionHistory = () => {
  const navigate = useNavigate();
  const { stationId } = useParams();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Statistics
  const [stationStats, setStationStats] = useState({
    totalTransactions: 0,
    totalFuelDispensed: 0,
    totalPetrolDispensed: 0,
    totalDieselDispensed: 0,
    averagePerTransaction: 0,
    topFuelDay: null,
    peakHour: null,
    recentTransactions: 0
  });

  // Load data
  useEffect(() => {
    if (stationId) {
      loadStationData();
    }
  }, [stationId]);

  // Filter transactions when filters change
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, fuelTypeFilter, dateFilter, customStartDate, customEndDate]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      
      // Load station information
      const stationResponse = await FuelStationService.getStationById(stationId);
      setStation(stationResponse.data);

      // Load transactions for this specific station
      const transactionsResponse = await FuelQuotaService.getStationTransactions(stationId);
      const stationTransactions = transactionsResponse.data.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setTransactions(stationTransactions);
      calculateStats(stationTransactions);

    } catch (error) {
      console.error('Error loading station transaction data:', error);
      NotificationService.error('Failed to load station transaction data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionList) => {
    if (transactionList.length === 0) {
      setStationStats({
        totalTransactions: 0,
        totalFuelDispensed: 0,
        totalPetrolDispensed: 0,
        totalDieselDispensed: 0,
        averagePerTransaction: 0,
        topFuelDay: null,
        peakHour: null,
        recentTransactions: 0
      });
      return;
    }

    const totalFuel = transactionList.reduce((sum, t) => sum + (t.amount || 0), 0);
    const petrolTransactions = transactionList.filter(t => t.fuelType === 'Petrol');
    const dieselTransactions = transactionList.filter(t => t.fuelType === 'Diesel');
    
    // Calculate daily totals to find peak day
    const dailyTotals = {};
    transactionList.forEach(t => {
      const date = new Date(t.timestamp).toDateString();
      dailyTotals[date] = (dailyTotals[date] || 0) + t.amount;
    });
    
    const topFuelDay = Object.entries(dailyTotals).reduce((max, [date, amount]) => 
      amount > (max.amount || 0) ? { date, amount } : max, {}
    );

    // Calculate hourly distribution for peak hour
    const hourlyTotals = {};
    transactionList.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourlyTotals[hour] = (hourlyTotals[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourlyTotals).reduce((max, [hour, count]) => 
      count > (max.count || 0) ? { hour: parseInt(hour), count } : max, {}
    );

    // Recent transactions (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = transactionList.filter(t => new Date(t.timestamp) >= weekAgo).length;

    const stats = {
      totalTransactions: transactionList.length,
      totalFuelDispensed: totalFuel,
      totalPetrolDispensed: petrolTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalDieselDispensed: dieselTransactions.reduce((sum, t) => sum + t.amount, 0),
      averagePerTransaction: totalFuel / transactionList.length,
      topFuelDay: topFuelDay.date ? {
        date: topFuelDay.date,
        amount: topFuelDay.amount
      } : null,
      peakHour: peakHour.hour !== undefined ? {
        hour: peakHour.hour,
        count: peakHour.count
      } : null,
      recentTransactions: recentCount
    };
    
    setStationStats(stats);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.vehicleRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by fuel type
    if (fuelTypeFilter) {
      filtered = filtered.filter(transaction => transaction.fuelType === fuelTypeFilter);
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(t => new Date(t.timestamp).toDateString() === now.toDateString());
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.timestamp) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = filtered.filter(t => new Date(t.timestamp) >= monthAgo);
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };

  const handleExportTransactions = () => {
    const exportData = filteredTransactions.map(transaction => ({
      'Transaction ID': transaction.id,
      'Date & Time': DateUtils.formatTimestamp(transaction.timestamp),
      'Vehicle Registration': transaction.vehicleRegNo,
      'Owner Name': transaction.ownerName || 'N/A',
      'Fuel Type': transaction.fuelType,
      'Amount (L)': transaction.amount,
      'Status': transaction.notificationSent ? 'Completed' : 'Pending'
    }));

    DownloadUtils.downloadCSV(
      exportData, 
      DownloadUtils.generateReportFilename(`${station?.name || 'station'}_transactions`, 'csv')
    );
    NotificationService.success('Transactions exported successfully!');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPeakHour = (hour) => {
    if (hour === undefined || hour === null) return 'N/A';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading station transaction history...
        </Typography>
      </Container>
    );
  }

  if (!station) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Station not found or you don't have permission to view this station's transactions.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/transactions')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HistoryIcon sx={{ mr: 0.5 }} fontSize="small" />
          All Transactions
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <StationIcon sx={{ mr: 0.5 }} fontSize="small" />
          {station.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton onClick={() => navigate('/transactions')} sx={{ mr: 1 }}>
              <BackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {station.name} - Transaction History
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            {station.address}, {station.city} • Registration: {station.registrationNumber}
          </Typography>
        </Box>
        <Tooltip title="Refresh Transactions">
          <IconButton onClick={loadStationData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Station Info Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: station.isActive ? 'success.main' : 'error.main', width: 56, height: 56 }}>
                <StationIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6">{station.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {station.address}, {station.city}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {station.hasPetrol && <Chip label="Petrol" size="small" color="success" />}
                  {station.hasDiesel && <Chip label="Diesel" size="small" color="primary" />}
                  <Chip 
                    label={station.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={station.isActive ? 'success' : 'error'} 
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Owner: {station.ownerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact: {station.contactNumber || 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Transactions
                  </Typography>
                  <Typography variant="h4">
                    {stationStats.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stationStats.recentTransactions} this week
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <HistoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Fuel Dispensed
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {FormatUtils.formatFuelAmount(stationStats.totalFuelDispensed)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {FormatUtils.formatFuelAmount(stationStats.averagePerTransaction)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <FuelIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Peak Day
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {stationStats.topFuelDay ? 
                      FormatUtils.formatFuelAmount(stationStats.topFuelDay.amount) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stationStats.topFuelDay ? 
                      new Date(stationStats.topFuelDay.date).toLocaleDateString() : 'No data'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Peak Hour
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {formatPeakHour(stationStats.peakHour?.hour)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stationStats.peakHour?.count || 0} transactions
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fuel Type Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Petrol Transactions
              </Typography>
              <Typography variant="h4" color="success.main">
                {FormatUtils.formatFuelAmount(stationStats.totalPetrolDispensed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transactions.filter(t => t.fuelType === 'Petrol').length} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Diesel Transactions
              </Typography>
              <Typography variant="h4" color="primary.main">
                {FormatUtils.formatFuelAmount(stationStats.totalDieselDispensed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transactions.filter(t => t.fuelType === 'Diesel').length} transactions
              </Typography>
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
              label="Search Transactions"
              placeholder="Search by vehicle or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value)}
                label="Fuel Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Petrol">Petrol</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFuelTypeFilter('');
                  setDateFilter('month');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportTransactions}
                disabled={filteredTransactions.length === 0}
              >
                Export
              </Button>
            </Box>
          </Grid>

          {dateFilter === 'custom' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Transaction History ({filteredTransactions.length} transactions)
          </Typography>
        </Box>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Fuel Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{transaction.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <VehicleIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">
                        {transaction.vehicleRegNo}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.ownerName || 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={transaction.fuelType}
                      size="small"
                      color={transaction.fuelType === 'Petrol' ? 'success' : 'primary'}
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {FormatUtils.formatFuelAmount(transaction.amount)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {DateUtils.formatTimestamp(transaction.timestamp)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={transaction.notificationSent ? 'Completed' : 'Pending'}
                      size="small"
                      color={transaction.notificationSent ? 'success' : 'warning'}
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(transaction)}
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
          rowsPerPageOptions={[10, 15, 25, 50, 100]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Transaction Details - #{selectedTransaction?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Transaction Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Transaction Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  #{selectedTransaction.id}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {DateUtils.formatTimestamp(selectedTransaction.timestamp)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Fuel Type
                </Typography>
                <Chip
                  label={selectedTransaction.fuelType}
                  color={selectedTransaction.fuelType === 'Petrol' ? 'success' : 'primary'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount Dispensed
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {FormatUtils.formatFuelAmount(selectedTransaction.amount)}
                </Typography>
              </Grid>

              {/* Vehicle Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Vehicle Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <VehicleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedTransaction.vehicleRegNo}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              

              {/* Station Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Station Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Station Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {station.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Transaction Status
                </Typography>
                <Chip
                  label={selectedTransaction.notificationSent ? 'Completed' : 'Pending'}
                  color={selectedTransaction.notificationSent ? 'success' : 'warning'}
                  sx={{ mt: 0.5 }}
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

export default StationTransactionHistory;