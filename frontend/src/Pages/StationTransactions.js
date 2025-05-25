// src/pages/StationTransactions.js
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
  Tab,
  Tabs
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
  DateRange as DateIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FuelQuotaService, FuelStationService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils, DownloadUtils } from '../utils';

const StationTransactions = () => {
  const navigate = useNavigate();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Statistics
  const [transactionStats, setTransactionStats] = useState({
    todayCount: 0,
    todayFuel: 0,
    todayPetrol: 0,
    todayDiesel: 0,
    totalCount: 0,
    totalFuel: 0,
    recentAverage: 0
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Filter transactions when filters change
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, stationFilter, fuelTypeFilter, dateFilter, customStartDate, customEndDate, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user's stations
      const stationsResponse = await FuelStationService.getMyStations();
      setStations(stationsResponse.data);

      // Load transactions for all stations
      const transactionPromises = stationsResponse.data.map(async (station) => {
        try {
          const transactionsResponse = await FuelQuotaService.getStationTransactions(station.id);
          return transactionsResponse.data.map(transaction => ({
            ...transaction,
            stationName: station.name,
            stationId: station.id
          }));
        } catch (error) {
          console.error(`Error fetching transactions for station ${station.id}:`, error);
          return [];
        }
      });

      const allTransactions = await Promise.all(transactionPromises);
      const flatTransactions = allTransactions.flat().sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setTransactions(flatTransactions);
      calculateStats(flatTransactions);

    } catch (error) {
      console.error('Error loading transaction data:', error);
      NotificationService.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionList) => {
    const today = new Date().toDateString();
    const todayTransactions = transactionList.filter(t => 
      new Date(t.timestamp).toDateString() === today
    );

    const stats = {
      todayCount: todayTransactions.length,
      todayFuel: todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      todayPetrol: todayTransactions.filter(t => t.fuelType === 'Petrol').reduce((sum, t) => sum + (t.amount || 0), 0),
      todayDiesel: todayTransactions.filter(t => t.fuelType === 'Diesel').reduce((sum, t) => sum + (t.amount || 0), 0),
      totalCount: transactionList.length,
      totalFuel: transactionList.reduce((sum, t) => sum + (t.amount || 0), 0),
      recentAverage: transactionList.length > 0 ? (transactionList.reduce((sum, t) => sum + (t.amount || 0), 0) / transactionList.length) : 0
    };
    setTransactionStats(stats);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.vehicleRegNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by station
    if (stationFilter) {
      filtered = filtered.filter(transaction => transaction.stationId.toString() === stationFilter);
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
      endDate.setHours(23, 59, 59, 999); // Include full end date
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Filter by tab
    if (activeTab === 1) { // Failed/Pending
      filtered = filtered.filter(t => !t.notificationSent);
    } else if (activeTab === 2) { // High Volume (>50L)
      filtered = filtered.filter(t => t.amount > 50);
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
      'Station': transaction.stationName,
      'Fuel Type': transaction.fuelType,
      'Amount (L)': transaction.amount,
      'Status': transaction.notificationSent ? 'Completed' : 'Pending'
    }));

    DownloadUtils.downloadCSV(
      exportData, 
      DownloadUtils.generateReportFilename('station_transactions', 'csv')
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

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Today's Transactions
                </Typography>
                <Typography variant="h4">
                  {transactionStats.todayCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {FormatUtils.formatFuelAmount(transactionStats.todayFuel)} dispensed
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
                  Today's Petrol
                </Typography>
                <Typography variant="h4" color="success.main">
                  {FormatUtils.formatFuelAmount(transactionStats.todayPetrol)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
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
                  Today's Diesel
                </Typography>
                <Typography variant="h4" color="info.main">
                  {FormatUtils.formatFuelAmount(transactionStats.todayDiesel)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
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
                  Average per Transaction
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {FormatUtils.formatFuelAmount(transactionStats.recentAverage)}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <TrendingIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Transactions"
            placeholder="Search by vehicle, station, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Station</InputLabel>
            <Select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              label="Station"
            >
              <MenuItem value="">All Stations</MenuItem>
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id.toString()}>
                  {station.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStationFilter('');
                setFuelTypeFilter('');
                setDateFilter('today');
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
            >
              Export
            </Button>
          </Box>
        </Grid>

        {dateFilter === 'custom' && (
          <>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
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
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading transactions...
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
            Transaction Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor and manage fuel transactions across your stations
          </Typography>
        </Box>
        <Tooltip title="Refresh Transactions">
          <IconButton onClick={loadData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All Transactions (${transactions.length})`} icon={<HistoryIcon />} />
          <Tab 
            label={`Failed/Pending (${transactions.filter(t => !t.notificationSent).length})`} 
            icon={<ReceiptIcon />} 
          />
          <Tab 
            label={`High Volume (${transactions.filter(t => t.amount > 50).length})`} 
            icon={<TrendingIcon />} 
          />
        </Tabs>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Fuel</TableCell>
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
                    <Typography variant="body2">
                      {transaction.stationName}
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
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
                      {selectedTransaction.stationName}
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

export default StationTransactions;