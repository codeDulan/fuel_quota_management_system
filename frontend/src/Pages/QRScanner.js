// src/pages/QRScanner.js (Fixed version)
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  Search as SearchIcon,
  LocalGasStation as FuelIcon,
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Business as StationIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FuelQuotaService, FuelStationService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { FormatUtils, QuotaUtils } from '../utils';

const QRScanner = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('stationId');
  
  // State management
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [quotaData, setQuotaData] = useState(null);
  const [station, setStation] = useState(null);
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false);
  const [fuelAmount, setFuelAmount] = useState('');
  const [dispensing, setDispensing] = useState(false);
  
  // Station selection states
  const [availableStations, setAvailableStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [loadingStations, setLoadingStations] = useState(false);

  // Load station data or available stations
  useEffect(() => {
    if (stationId) {
      loadStationData();
    } else {
      loadAvailableStations();
    }
  }, [stationId]);

  const loadStationData = async () => {
    try {
      console.log('Loading station data for ID:', stationId);
      const response = await FuelStationService.getStationById(stationId);
      console.log('Station loaded:', response.data);
      setStation(response.data);
    } catch (error) {
      console.error('Failed to load station data:', error);
      NotificationService.error('Failed to load station data');
    }
  };

  const loadAvailableStations = async () => {
    setLoadingStations(true);
    try {
      const response = await FuelStationService.getMyStations();
      setAvailableStations(response.data);
      
      // If user has only one station, auto-select it
      if (response.data.length === 1) {
        const autoStation = response.data[0];
        setSelectedStationId(autoStation.id);
        setStation(autoStation);
        // Update URL to include the station ID
        navigate(`/qr-scanner?stationId=${autoStation.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load stations:', error);
      NotificationService.error('Failed to load your stations');
    } finally {
      setLoadingStations(false);
    }
  };

  const handleStationSelect = (stationId) => {
    const selectedStation = availableStations.find(s => s.id === stationId);
    if (selectedStation) {
      setSelectedStationId(stationId);
      setStation(selectedStation);
      // Update URL with selected station
      navigate(`/qr-scanner?stationId=${stationId}`, { replace: true });
    }
  };

  // Handle QR code scan/input
  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      NotificationService.warning('Please enter a QR code or registration number');
      return;
    }

    setScanning(true);
    setVehicleData(null);
    setQuotaData(null);

    try {
      // First, try to get quota info by QR code
      const response = await FuelQuotaService.checkQuotaByQR(qrInput.trim().toUpperCase());
      
      setVehicleData({
        id: response.data.vehicleId,
        registrationNumber: response.data.registrationNumber,
        vehicleType: response.data.vehicleType,
        fuelType: response.data.fuelType,
        engineCapacity: response.data.engineCapacity,
        ownerName: response.data.ownerName,
        ownerPhone: response.data.ownerPhone
      });

      setQuotaData({
        allocatedQuota: response.data.allocatedQuota,
        remainingQuota: response.data.remainingQuota,
        usedQuota: response.data.usedQuota,
        usagePercentage: response.data.usagePercentage,
        expiringSoon: response.data.expiringSoon,
        quotaStartDate: response.data.quotaStartDate,
        quotaEndDate: response.data.quotaEndDate
      });

      NotificationService.success('Vehicle quota information loaded successfully!');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to scan QR code';
      
      if (error.response?.status === 400) {
        NotificationService.error(`Vehicle not found: ${qrInput}. Please check if the vehicle is registered in the fuel quota system.`);
      } else {
        NotificationService.error(errorMessage);
      }
      
      console.error('QR Scan Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        input: qrInput
      });
    } finally {
      setScanning(false);
    }
  };

  // Handle fuel dispensing
  const handleDispenseFuel = () => {
    if (!vehicleData || !quotaData) {
      NotificationService.error('No vehicle data available');
      return;
    }

    if (!station) {
      NotificationService.error('Please select a station first');
      return;
    }

    // Check if station supports the vehicle's fuel type
    const vehicleFuelType = vehicleData.fuelType.toLowerCase();
    const stationSupports = (vehicleFuelType === 'petrol' && station?.hasPetrol) || 
                           (vehicleFuelType === 'diesel' && station?.hasDiesel);

    if (!stationSupports) {
      NotificationService.error(`This station does not offer ${vehicleData.fuelType}. Available: ${station.hasPetrol ? 'Petrol ' : ''}${station.hasDiesel ? 'Diesel' : ''}`);
      return;
    }

    setFuelDialogOpen(true);
  };

  // Process fuel transaction
  const processFuelTransaction = async () => {
    const amount = parseFloat(fuelAmount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      NotificationService.error('Please enter a valid fuel amount');
      return;
    }

    if (amount > quotaData.remainingQuota) {
      NotificationService.error(`Insufficient quota! Remaining: ${quotaData.remainingQuota}L`);
      return;
    }

    if (amount > 100) {
      NotificationService.error('Maximum 100 liters per transaction');
      return;
    }

    setDispensing(true);

    try {
      await FuelQuotaService.recordFuelPump({
        vehicleId: vehicleData.id,
        stationId: station.id,
        fuelType: vehicleData.fuelType,
        amount: amount
      });

      NotificationService.transactionSuccess(
        vehicleData.registrationNumber,
        amount,
        vehicleData.fuelType,
        quotaData.remainingQuota - amount
      );

      // Refresh quota data
      handleScanQR();
      
      setFuelDialogOpen(false);
      setFuelAmount('');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process fuel transaction';
      NotificationService.error(errorMessage);
    } finally {
      setDispensing(false);
    }
  };

  // Render station selection
  const renderStationSelection = () => {
    if (station || loadingStations) return null;

    if (availableStations.length === 0) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2">
              No stations found. You need to register a fuel station first before using the QR scanner.
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => navigate('/station/register')}
            >
              Register Station
            </Button>
          </Box>
        </Alert>
      );
    }

    return (
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <StationIcon sx={{ mr: 1 }} />
          Select Your Station
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose which station you want to operate the QR scanner for.
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Choose Station</InputLabel>
          <Select
            value={selectedStationId || ''}
            onChange={(e) => handleStationSelect(e.target.value)}
            label="Choose Station"
          >
            {availableStations.map((stationOption) => (
              <MenuItem key={stationOption.id} value={stationOption.id}>
                <Box>
                  <Typography variant="body1">
                    {stationOption.name} - {stationOption.city}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {stationOption.hasPetrol && (
                      <Chip label="Petrol" size="small" color="success" />
                    )}
                    {stationOption.hasDiesel && (
                      <Chip label="Diesel" size="small" color="primary" />
                    )}
                    <Chip 
                      label={stationOption.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={stationOption.isActive ? 'success' : 'default'} 
                    />
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
    );
  };

  // Render vehicle information card
  const renderVehicleInfo = () => {
    if (!vehicleData) return null;

    const quotaStatus = QuotaUtils.getQuotaStatus(quotaData.remainingQuota, quotaData.allocatedQuota);
    const quotaPercentage = QuotaUtils.calculateQuotaPercentage(quotaData.remainingQuota, quotaData.allocatedQuota);

    return (
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
            Vehicle Information
          </Typography>

          <Grid container spacing={2}>
            {/* Vehicle Details */}
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Registration Number"
                    secondary={
                      <Typography variant="h6" color="primary">
                        {vehicleData.registrationNumber}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Vehicle Type"
                    secondary={FormatUtils.formatVehicleType(vehicleData.vehicleType)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Engine Capacity"
                    secondary={`${vehicleData.engineCapacity}cc`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Fuel Type"
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={vehicleData.fuelType}
                          color={vehicleData.fuelType === 'Petrol' ? 'success' : 'primary'}
                          size="small"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Owner Details */}
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Owner Name"
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {vehicleData.ownerName}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Contact Number"
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {vehicleData.ownerPhone}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Quota Information */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <FuelIcon sx={{ mr: 1 }} />
                Fuel Quota Status
              </Typography>
              <Chip 
                label={quotaStatus.message}
                color={quotaStatus.color}
                icon={quotaPercentage <= 10 ? <WarningIcon /> : <CheckIcon />}
              />
            </Box>

            <LinearProgress 
              variant="determinate" 
              value={quotaPercentage} 
              color={quotaStatus.color}
              sx={{ height: 12, borderRadius: 6, mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Allocated
                </Typography>
                <Typography variant="h6">
                  {FormatUtils.formatFuelAmount(quotaData.allocatedQuota)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" color={quotaStatus.color}>
                  {FormatUtils.formatFuelAmount(quotaData.remainingQuota)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Used
                </Typography>
                <Typography variant="h6">
                  {FormatUtils.formatFuelAmount(quotaData.usedQuota)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Quota Alerts */}
          {quotaData.expiringSoon && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2">
                  ⚠️ Quota expires soon: {new Date(quotaData.quotaEndDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Alert>
          )}

          {quotaPercentage <= 10 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2">
                  🚨 Critical low quota! Only {FormatUtils.formatFuelAmount(quotaData.remainingQuota)} remaining.
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<FuelIcon />}
              onClick={handleDispenseFuel}
              disabled={quotaData.remainingQuota <= 0 || !station}
              size="large"
            >
              Dispense Fuel
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setVehicleData(null);
                setQuotaData(null);
                setQrInput('');
              }}
            >
              Scan Another
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Vehicle QR Scanner
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Scan vehicle QR codes to check fuel quota and dispense fuel
      </Typography>

      {/* Loading indicator */}
      {loadingStations && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Station Selection */}
      {renderStationSelection()}

      {/* Current Station Info */}
      {station && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2">
              <strong>Current Station:</strong> {station.name} - {station.city}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                <strong>Available Fuels:</strong>
              </Typography>
              {station.hasPetrol && <Chip label="Petrol" size="small" color="success" sx={{ mr: 1 }} />}
              {station.hasDiesel && <Chip label="Diesel" size="small" color="primary" />}
            </Box>
          </Box>
        </Alert>
      )}

      {/* QR Scanner Input - Only show if station is selected */}
      {station && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScanIcon sx={{ mr: 1 }} />
            Scan or Enter QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Scan the vehicle's QR code or manually enter the registration number to check fuel quota.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="QR Code / Registration Number"
              placeholder="e.g., WP-CAB-1234"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
            />
            <Button
              variant="contained"
              onClick={handleScanQR}
              disabled={scanning}
              startIcon={scanning ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {scanning ? 'Scanning...' : 'Check Quota'}
            </Button>
          </Box>

          <Alert severity="info">
            <Box>
              <Typography variant="body2">
                💡 <strong>Tip:</strong> You can scan the QR code displayed in the vehicle owner's mobile app or 
                manually enter the vehicle registration number.
              </Typography>
            </Box>
          </Alert>
        </Paper>
      )}

      {/* Vehicle Information */}
      {renderVehicleInfo()}

      {/* Fuel Dispensing Dialog */}
      <Dialog 
        open={fuelDialogOpen} 
        onClose={() => setFuelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Dispense Fuel - {vehicleData?.registrationNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Station:</strong> {station?.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Fuel Type:</strong> {vehicleData?.fuelType}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Available Quota:</strong> {FormatUtils.formatFuelAmount(quotaData?.remainingQuota)}
            </Typography>
            
            <TextField
              fullWidth
              label="Fuel Amount (Liters)"
              type="number"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
              placeholder="0.0"
              inputProps={{ min: 0.1, max: Math.min(100, quotaData?.remainingQuota || 0), step: 0.1 }}
              sx={{ mt: 2 }}
              helperText={`Maximum: ${Math.min(100, quotaData?.remainingQuota || 0)}L`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFuelDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={processFuelTransaction}
            variant="contained"
            disabled={dispensing || !fuelAmount}
            startIcon={dispensing ? <CircularProgress size={20} /> : <FuelIcon />}
          >
            {dispensing ? 'Processing...' : 'Dispense Fuel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/station/transactions')}
        >
          View Transactions
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/station/list')}
        >
          Back to Stations
        </Button>
      </Box>
    </Container>
  );
};

export default QRScanner;