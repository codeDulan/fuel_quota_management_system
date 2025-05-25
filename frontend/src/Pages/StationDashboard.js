// src/pages/StationDashboard.js (Enhanced with Real API Data)
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LocalGasStation as StationIcon,
  QrCodeScanner as ScanIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { FuelStationService, FuelQuotaService } from "../services/ApiService";
import AuthService from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import { FormatUtils, DateUtils } from "../utils";

const StationDashboard = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // State management
  const [stations, setStations] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalStations: 0,
    activeStations: 0,
    todayTransactions: 0,
    totalFuelDispensed: 0,
    todayRevenue: 0,
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user's stations
      const stationsResponse = await FuelStationService.getMyStations();
      const stationsList = stationsResponse.data;
      setStations(stationsList);

      if (stationsList.length === 0) {
        setLoading(false);
        return;
      }

      // Load recent transactions for all stations
      const transactionPromises = stationsList.map(async (station) => {
        try {
          const transactionsResponse =
            await FuelQuotaService.getStationTransactions(station.id);
          return transactionsResponse.data;
        } catch (error) {
          console.error(
            `Error fetching transactions for station ${station.id}:`,
            error
          );
          return [];
        }
      });

      const allTransactions = await Promise.all(transactionPromises);
      const flatTransactions = allTransactions
        .flat()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setRecentTransactions(flatTransactions.slice(0, 3)); // Last 10 transactions

      // Calculate dashboard statistics
      calculateDashboardStats(stationsList, flatTransactions);
    } catch (error) {
      NotificationService.error("Failed to load dashboard data");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard statistics
  const calculateDashboardStats = (stationsList, allTransactions) => {
    const today = new Date().toDateString();
    const todayTransactions = allTransactions.filter(
      (t) => new Date(t.timestamp).toDateString() === today
    );

    const stats = {
      totalStations: stationsList.length,
      activeStations: stationsList.filter((s) => s.isActive).length,
      todayTransactions: todayTransactions.length,
      totalFuelDispensed: allTransactions.reduce(
        (total, t) => total + (t.amount || 0),
        0
      ),
      todayFuelDispensed: todayTransactions.reduce(
        (total, t) => total + (t.amount || 0),
        0
      ),
    };

    setDashboardStats(stats);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    NotificationService.success("Dashboard refreshed!");
  };

  // Render quick action buttons
  const renderQuickActions = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Quick Actions</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon
              sx={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ScanIcon />}
            onClick={() => navigate("/qr-scanner")}
            size="large"
          >
            Scan QR Code
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => navigate("/station/register")}
          >
            Add Station
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<StationIcon />}
            onClick={() => navigate("/stations")}
          >
            My Stations
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/transactions")}
          >
            Transactions
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render summary cards
  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Total Stations */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Your Stations
                </Typography>
                <Typography variant="h4">
                  {dashboardStats.totalStations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dashboardStats.activeStations} active
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <StationIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Transactions */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Today's Transactions
                </Typography>
                <Typography variant="h4">
                  {dashboardStats.todayTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vehicles served
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <HistoryIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Fuel Dispensed Today */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Today's Fuel
                </Typography>
                <Typography variant="h4">
                  {FormatUtils.formatFuelAmount(
                    dashboardStats.todayFuelDispensed
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dispensed today
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <StationIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Fuel Dispensed */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Fuel
                </Typography>
                <Typography variant="h4">
                  {FormatUtils.formatFuelAmount(
                    dashboardStats.totalFuelDispensed
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All time
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "info.main" }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render station overview
  const renderStationOverview = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Station Overview
      </Typography>

      {stations.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body1">
            You haven't registered any fuel stations yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/station/add")}
            sx={{ mt: 1 }}
          >
            Register Your First Station
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {stations.map((station) => (
            <Grid item xs={12} md={6} key={station.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{station.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {station.address}, {station.city}
                      </Typography>
                    </Box>
                    <Chip
                      label={station.status}
                      color={station.isActive ? "success" : "error"}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    {station.hasPetrol && (
                      <Chip label="Petrol" color="success" size="small" />
                    )}
                    {station.hasDiesel && (
                      <Chip label="Diesel" color="primary" size="small" />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ScanIcon />}
                    onClick={() =>
                      navigate(`/qr-scanner?stationId=${station.id}`)
                    }
                  >
                    Scan QR
                  </Button>
                  
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );

  // Render recent transactions
  const renderRecentTransactions = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Transactions
      </Typography>

      {recentTransactions.length === 0 ? (
        <Alert severity="info">
          <Typography>No recent transactions found.</Typography>
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Fuel Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {transaction.vehicleRegNo}
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
                      color={
                        transaction.fuelType === "Petrol"
                          ? "success"
                          : "primary"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {FormatUtils.formatFuelAmount(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {DateUtils.getRelativeTime(transaction.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        transaction.notificationSent ? "Complete" : "Pending"
                      }
                      color={
                        transaction.notificationSent ? "success" : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => navigate("/transactions")}
        >
          View All Transactions
        </Button>
      </Box>
    </Paper>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser?.username || "Station Owner"}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor your fuel stations and manage transactions
        </Typography>
      </Box>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Station Overview */}
        <Grid item xs={12} lg={8}>
          {renderStationOverview()}
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} lg={4}>
          {renderRecentTransactions()}
        </Grid>
      </Grid>

      {/* No Stations Alert */}
      {stations.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body1">
            <strong>🏪 Get Started:</strong> Register your first fuel station to
            start serving customers and managing fuel transactions through the
            quota system.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/transactions")}
          >
            View All Transactions
          </Button>
        </Alert>
      )}
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
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default StationDashboard;
