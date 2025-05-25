// src/pages/StationList.js
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
  Chip,
  Alert,
  CircularProgress,
  Fab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  LocalGasStation as StationIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  QrCodeScanner as ScanIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { FuelStationService } from "../services/ApiService";
import NotificationService from "../services/NotificationService";
import { FormatUtils } from "../utils";

const StationList = () => {
  const navigate = useNavigate();

  // State management
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Load stations
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await FuelStationService.getMyStations();
      setStations(response.data);
    } catch (error) {
      NotificationService.error("Failed to load stations");
      console.error("Error loading stations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle menu open/close
  const handleMenuOpen = (event, station) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStation(station);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedStation(null);
  };

  // Handle edit station
  const handleEditStation = () => {
    setEditFormData({
      name: selectedStation.name,
      address: selectedStation.address,
      city: selectedStation.city,
      contactNumber: selectedStation.contactNumber,
      hasPetrol: selectedStation.hasPetrol,
      hasDiesel: selectedStation.hasDiesel,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      await FuelStationService.updateStation(selectedStation.id, editFormData);
      NotificationService.success("Station updated successfully!");
      setEditDialogOpen(false);
      loadStations(); // Reload stations
    } catch (error) {
      NotificationService.error("Failed to update station");
    }
  };

  // Handle navigation
  const handleScanQR = (stationId) => {
    navigate(`/station/scan?stationId=${stationId}`);
    handleMenuClose();
  };

  const handleViewTransactions = (stationId) => {
    navigate(`/station/transactions/${stationId}`);
    handleMenuClose();
  };

  const handleViewAnalytics = (stationId) => {
    navigate(`/station/analytics/${stationId}`);
    handleMenuClose();
  };

  // Render station card
  const renderStationCard = (station) => (
    <Grid item xs={12} md={6} lg={4} key={station.id}>
      <Card
        elevation={3}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Station Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <StationIcon sx={{ mr: 1, color: "primary.main" }} />
                {station.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {station.registrationNumber}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip
                label={station.status}
                color={station.isActive ? "success" : "error"}
                size="small"
              />
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, station)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Station Details */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
              <LocationIcon
                sx={{ fontSize: 16, color: "text.secondary", mr: 1, mt: 0.2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {station.address}, {station.city}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <PhoneIcon
                sx={{ fontSize: 16, color: "text.secondary", mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {station.contactNumber}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BusinessIcon
                sx={{ fontSize: 16, color: "text.secondary", mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Owner: {station.ownerName}
              </Typography>
            </Box>
          </Box>

          {/* Fuel Types */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {station.hasPetrol && (
              <Chip
                label="Petrol"
                color="success"
                size="small"
                icon={<StationIcon />}
              />
            )}
            {station.hasDiesel && (
              <Chip
                label="Diesel"
                color="primary"
                size="small"
                icon={<StationIcon />}
              />
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<ScanIcon />}
            onClick={() => handleScanQR(station.id)}
            variant="contained"
          >
            Scan QR
          </Button>

          <Box>
            <Tooltip title="Transaction history">
              <IconButton
                size="small"
                onClick={() => handleViewTransactions(station.id)}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>

            
          </Box>
        </CardActions>
      </Card>
    </Grid>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your stations...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Fuel Stations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your registered fuel stations and monitor transactions
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/station/register")} // Fixed
          size="large"
        >
          Add Station
        </Button>
      </Box>

      {/* Summary Cards */}
      {stations.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <StationIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="h5">{stations.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Registered Stations
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <BusinessIcon
                sx={{ fontSize: 40, color: "success.main", mb: 1 }}
              />
              <Typography variant="h5">
                {stations.filter((s) => s.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Stations
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <ScanIcon sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
              <Typography variant="h5">
                {stations.filter((s) => s.hasPetrol && s.hasDiesel).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full Service Stations
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Stations Grid */}
      {stations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <StationIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Stations Registered
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't registered any fuel stations yet. Register your first
            station to start serving customers.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate("/station/add")}
          >
            Register Your First Station
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {stations.map(renderStationCard)}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleScanQR(selectedStation?.id)}>
          <ScanIcon sx={{ mr: 1 }} />
          Scan Vehicle QR
        </MenuItem>
        <MenuItem onClick={handleEditStation}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Station
        </MenuItem>
        <MenuItem onClick={() => handleViewTransactions(selectedStation?.id)}>
          <HistoryIcon sx={{ mr: 1 }} />
          View Transactions
        </MenuItem>
        <MenuItem onClick={() => handleViewAnalytics(selectedStation?.id)}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          View Analytics
        </MenuItem>
      </Menu>

      {/* Edit Station Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Station Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Station Name"
                value={editFormData.name || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editFormData.address || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.city || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={editFormData.contactNumber || ""}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    contactNumber: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add station"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
        }}
        onClick={() => navigate("/station/add")}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default StationList;
