// src/pages/AdminReports.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tab,
  Tabs,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  LocalGasStation as FuelIcon,
  DirectionsCar as VehicleIcon,
  Business as StationIcon,
  TrendingUp as TrendingIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  BarChart as ChartIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import { AdminService, ApiErrorHandler } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils, DownloadUtils } from '../utils';

const AdminReports = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState({
    fuelConsumption: null,
    quotaUtilization: null,
    vehicleRegistration: null,
    stationPerformance: null,
    topConsumers: null,
    usageTrends: null
  });

  // Date filters
  const [dateFilters, setDateFilters] = useState({
    startDate: DateUtils.formatDateForAPI(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), // Start of current month
    endDate: DateUtils.formatDateForAPI(new Date()),
    period: 'month',
    fuelType: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  // Load initial reports
  useEffect(() => {
    loadReports();
  }, []);

  // Load all reports
  const loadReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFuelConsumptionReport(),
        loadQuotaUtilizationReport(),
        loadVehicleRegistrationReport(),
        loadStationPerformanceReport(),
        loadTopConsumers(),
        loadUsageTrends()
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load fuel consumption report
  const loadFuelConsumptionReport = async () => {
    try {
      const response = await AdminService.getFuelConsumptionReport(
        dateFilters.startDate,
        dateFilters.endDate,
        dateFilters.fuelType || null
      );
      setReports(prev => ({ ...prev, fuelConsumption: response.data }));
    } catch (error) {
      console.error('Error loading fuel consumption report:', error);
      NotificationService.error('Failed to load fuel consumption report');
    }
  };

  // Load quota utilization report
  const loadQuotaUtilizationReport = async () => {
    try {
      const response = await AdminService.getQuotaUtilizationReport(dateFilters.month);
      setReports(prev => ({ ...prev, quotaUtilization: response.data }));
    } catch (error) {
      console.error('Error loading quota utilization report:', error);
      NotificationService.error('Failed to load quota utilization report');
    }
  };

  // Load vehicle registration report
  const loadVehicleRegistrationReport = async () => {
    try {
      const response = await AdminService.getVehicleRegistrationReport(
        dateFilters.startDate,
        dateFilters.endDate
      );
      setReports(prev => ({ ...prev, vehicleRegistration: response.data }));
    } catch (error) {
      console.error('Error loading vehicle registration report:', error);
      NotificationService.error('Failed to load vehicle registration report');
    }
  };

  // Load station performance report
  const loadStationPerformanceReport = async () => {
    try {
      const response = await AdminService.getStationPerformanceReport(
        dateFilters.startDate,
        dateFilters.endDate
      );
      setReports(prev => ({ ...prev, stationPerformance: response.data }));
    } catch (error) {
      console.error('Error loading station performance report:', error);
      NotificationService.error('Failed to load station performance report');
    }
  };

  // Load top fuel consumers
  const loadTopConsumers = async () => {
    try {
      const response = await AdminService.getTopFuelConsumers(10, dateFilters.period);
      setReports(prev => ({ ...prev, topConsumers: response.data }));
    } catch (error) {
      console.error('Error loading top consumers:', error);
      NotificationService.error('Failed to load top consumers');
    }
  };

  // Load usage trends
  const loadUsageTrends = async () => {
    try {
      const response = await AdminService.getUsageTrends(
        dateFilters.startDate,
        dateFilters.endDate,
        'daily'
      );
      setReports(prev => ({ ...prev, usageTrends: response.data }));
    } catch (error) {
      console.error('Error loading usage trends:', error);
      NotificationService.error('Failed to load usage trends');
    }
  };

  // Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilters(prev => ({ ...prev, [field]: value }));
  };

  // Generate and refresh reports
  const handleGenerateReports = () => {
    loadReports();
    NotificationService.success('Reports refreshed successfully!');
  };

  // Export report data
  const handleExportReport = async (reportType) => {
    try {
      const response = await AdminService.exportTransactionData(
        dateFilters.startDate,
        dateFilters.endDate,
        'CSV'
      );
      
      const filename = DownloadUtils.generateReportFilename(`${reportType}_report`, 'csv');
      DownloadUtils.downloadBlob(response.data, filename);
      NotificationService.success('Report exported successfully!');
    } catch (error) {
      NotificationService.error('Failed to export report');
    }
  };

  // Render fuel consumption report
  const renderFuelConsumptionReport = () => {
    const report = reports.fuelConsumption;
    if (!report) return <CircularProgress />;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <FuelIcon sx={{ mr: 1 }} />
                Fuel Consumption Report
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('fuel-consumption')}
                size="small"
              >
                Export
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Petrol
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {FormatUtils.formatFuelAmount(report.totalPetrolConsumed)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Diesel
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {FormatUtils.formatFuelAmount(report.totalDieselConsumed)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Transactions
                    </Typography>
                    <Typography variant="h5">
                      {report.totalTransactions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Average per Transaction
                    </Typography>
                    <Typography variant="h5">
                      {FormatUtils.formatFuelAmount(report.averageFuelPerTransaction)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Details */}
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Report Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Period:</strong> {report.reportPeriod}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Most Active Station:</strong> {report.mostActiveStations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Peak Consumption Day:</strong> {report.peakConsumptionDay}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Total Fuel Consumed:</strong> {FormatUtils.formatFuelAmount(report.totalFuelConsumed)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render quota utilization report
  const renderQuotaUtilizationReport = () => {
    const report = reports.quotaUtilization;
    if (!report) return <CircularProgress />;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AnalyticsIcon sx={{ mr: 1 }} />
              Quota Utilization Report - {report.months}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Vehicles
                    </Typography>
                    <Typography variant="h5">
                      {report.totalVehicles}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Utilization Rate
                    </Typography>
                    <Typography variant="h5" color={report.utilizationPercentage > 50 ? 'success.main' : 'warning.main'}>
                      {FormatUtils.formatPercentage(report.utilizationPercentage)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Fully Utilized
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {report.vehiclesFullyUtilized}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Quota Allocated</TableCell>
                        <TableCell align="right">{FormatUtils.formatFuelAmount(report.totalQuotaAllocated)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Quota Used</TableCell>
                        <TableCell align="right">{FormatUtils.formatFuelAmount(report.totalQuotaUsed)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Quota Remaining</TableCell>
                        <TableCell align="right">{FormatUtils.formatFuelAmount(report.totalQuotaRemaining)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Vehicles Not Used</TableCell>
                        <TableCell align="right">{report.vehiclesNotUsed}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Average per Vehicle</TableCell>
                        <TableCell align="right">{FormatUtils.formatFuelAmount(report.averageUtilizationPerVehicle)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render vehicle registration report
  const renderVehicleRegistrationReport = () => {
    const report = reports.vehicleRegistration;
    if (!report) return <CircularProgress />;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <VehicleIcon sx={{ mr: 1 }} />
              Vehicle Registration Report
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Registrations
                    </Typography>
                    <Typography variant="h5">
                      {report.totalRegistrations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Cars
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {report.carRegistrations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Motorcycles
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {report.motorcycleRegistrations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Three Wheelers
                    </Typography>
                    <Typography variant="h5" color="info.main">
                      {report.threeWheelerRegistrations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Period:</strong> {report.reportPeriod}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Most Popular Vehicle Type:</strong> {report.mostPopularVehicleType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Most Popular Fuel Type:</strong> {report.mostPopularFuelType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Petrol Vehicles:</strong> {report.petrolVehicles} | <strong>Diesel Vehicles:</strong> {report.dieselVehicles}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render station performance report
  const renderStationPerformanceReport = () => {
    const report = reports.stationPerformance;
    if (!report) return <CircularProgress />;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StationIcon sx={{ mr: 1 }} />
              Station Performance Report
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Active Stations
                    </Typography>
                    <Typography variant="h5">
                      {report.totalActiveStations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Transactions
                    </Typography>
                    <Typography variant="h5">
                      {report.totalTransactions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Avg per Station
                    </Typography>
                    <Typography variant="h5">
                      {Math.round(report.averageTransactionsPerStation)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Fuel Dispensed
                    </Typography>
                    <Typography variant="h5">
                      {FormatUtils.formatFuelAmount(report.totalFuelDispenseds)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Period:</strong> {report.reportPeriod}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Top Performing Station:</strong> {report.topPerformingStation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Least Active Station:</strong> {report.leastActiveStations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Average Fuel per Station:</strong> {FormatUtils.formatFuelAmount(report.averageFuelPerStation)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Render top consumers
  const renderTopConsumers = () => {
    const consumers = reports.topConsumers;
    if (!consumers || !Array.isArray(consumers)) return <CircularProgress />;

    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingIcon sx={{ mr: 1 }} />
          Top Fuel Consumers
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Total Fuel</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Avg per Transaction</TableCell>
                <TableCell>Last Transaction</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consumers.map((consumer, index) => (
                <TableRow key={consumer.registrationNumber}>
                  <TableCell>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: index < 3 ? 'warning.main' : 'grey.300' }}>
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {consumer.registrationNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={consumer.vehicleType}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{consumer.ownerName}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {FormatUtils.formatFuelAmount(consumer.totalFuelConsumed)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{consumer.transactionCount}</TableCell>
                  <TableCell align="right">
                    {FormatUtils.formatFuelAmount(consumer.averagePerTransaction)}
                  </TableCell>
                  <TableCell>{consumer.lastTransactionDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Render filters
  const renderFilters = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Report Filters</Typography>
        <Box>
          <Tooltip title="Refresh Reports">
            <IconButton onClick={handleGenerateReports} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ChartIcon />}
            onClick={handleGenerateReports}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Generating...' : 'Generate Reports'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={dateFilters.startDate}
            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={dateFilters.endDate}
            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Fuel Type</InputLabel>
            <Select
              value={dateFilters.fuelType}
              onChange={(e) => handleDateFilterChange('fuelType', e.target.value)}
              label="Fuel Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Petrol">Petrol</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Period</InputLabel>
            <Select
              value={dateFilters.period}
              onChange={(e) => handleDateFilterChange('period', e.target.value)}
              label="Period"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Month"
            type="month"
            value={dateFilters.month}
            onChange={(e) => handleDateFilterChange('month', e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive reports on fuel consumption, quota utilization, and system performance
        </Typography>
      </Box>

      {/* Filters */}
      {renderFilters()}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Fuel Consumption" icon={<FuelIcon />} />
          <Tab label="Quota Utilization" icon={<AnalyticsIcon />} />
          <Tab label="Vehicle Registration" icon={<VehicleIcon />} />
          <Tab label="Station Performance" icon={<StationIcon />} />
          <Tab label="Top Consumers" icon={<TrendingIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && renderFuelConsumptionReport()}
          {activeTab === 1 && renderQuotaUtilizationReport()}
          {activeTab === 2 && renderVehicleRegistrationReport()}
          {activeTab === 3 && renderStationPerformanceReport()}
          {activeTab === 4 && renderTopConsumers()}
        </Box>
      )}
    </Container>
  );
};

export default AdminReports;