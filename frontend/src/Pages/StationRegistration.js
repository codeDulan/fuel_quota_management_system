
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  LocalGasStation as StationIcon,
  Check as CheckIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FuelStationService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { ValidationUtils } from '../utils';

const StationRegistration = () => {
  const navigate = useNavigate();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Station Details', 'Registration Complete'];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    address: '',
    city: '',
    contactNumber: '',
    hasPetrol: true,
    hasDiesel: true
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Sri Lankan cities for validation
  const sriLankanCities = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  // Handle input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Station name validation
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Station name must be at least 3 characters';
    }

    // Registration number validation (basic format)
    if (!formData.registrationNumber || formData.registrationNumber.trim().length < 5) {
      newErrors.registrationNumber = 'Registration number is required (min 5 characters)';
    }

    // Address validation
    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (min 10 characters)';
    }

    // City validation
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'City is required';
    }

    // Contact number validation
    const phoneValidation = ValidationUtils.validatePhoneNumber(formData.contactNumber);
    if (!phoneValidation.isValid) {
      newErrors.contactNumber = phoneValidation.message;
    }

    // Fuel type validation
    if (!formData.hasPetrol && !formData.hasDiesel) {
      newErrors.fuelTypes = 'Please select at least one fuel type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle station registration
  const handleRegistration = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await FuelStationService.registerStation({
        name: formData.name.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        contactNumber: formData.contactNumber.trim(),
        hasPetrol: formData.hasPetrol,
        hasDiesel: formData.hasDiesel
      });

      setActiveStep(1);
      setMessage('Fuel station registered successfully! You can now start serving customers.');
      setMessageType('success');
      NotificationService.registrationSuccess('Fuel Station', formData.name);

      // Redirect to station list after 3 seconds
      setTimeout(() => {
        navigate('/station/list');
      }, 3000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Station registration failed';
      setMessage(errorMessage);
      setMessageType('error');
      NotificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render station details form (Step 0)
  const renderStationDetailsForm = () => (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <StationIcon sx={{ mr: 1 }} />
        Enter Station Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Register your fuel station to participate in the fuel quota management system.
      </Typography>

      <Grid container spacing={3}>
        {/* Station Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Station Name"
            placeholder="e.g., City Fuel Station"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={!!errors.name}
            helperText={errors.name || 'Enter your fuel station name'}
            required
            InputProps={{
              startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>

        {/* Registration Number */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Business Registration Number"
            placeholder="e.g., SR-XXX-0000"
            value={formData.registrationNumber}
            onChange={handleInputChange('registrationNumber')}
            error={!!errors.registrationNumber}
            helperText={errors.registrationNumber || 'Your business registration number'}
            required
          />
        </Grid>

        {/* Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Complete Address"
            placeholder="e.g., No. 123, Main Street, Colombo 07"
            value={formData.address}
            onChange={handleInputChange('address')}
            error={!!errors.address}
            helperText={errors.address || 'Complete address including street and area'}
            required
            multiline
            rows={2}
            InputProps={{
              startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
            }}
          />
        </Grid>

        {/* City */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            placeholder="e.g., Colombo"
            value={formData.city}
            onChange={handleInputChange('city')}
            error={!!errors.city}
            helperText={errors.city || 'City where your station is located'}
            required
          />
        </Grid>

        {/* Contact Number */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Number"
            placeholder="e.g., 0112345678"
            value={formData.contactNumber}
            onChange={handleInputChange('contactNumber')}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber || 'Station contact number'}
            required
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>

        {/* Fuel Types */}
        <Grid item xs={12}>
          <FormControl component="fieldset" error={!!errors.fuelTypes}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Available Fuel Types *
            </FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasPetrol}
                    onChange={handleCheckboxChange('hasPetrol')}
                    color="success"
                  />
                }
                label="Petrol"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasDiesel}
                    onChange={handleCheckboxChange('hasDiesel')}
                    color="primary"
                  />
                }
                label="Diesel"
              />
            </FormGroup>
            {errors.fuelTypes && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.fuelTypes}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Preview Card */}
      {formData.name && formData.city && (
        <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Preview:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1">
                <strong>{formData.name}</strong> - {formData.city}
              </Typography>
              {formData.hasPetrol && (
                <Chip label="Petrol" color="success" size="small" />
              )}
              {formData.hasDiesel && (
                <Chip label="Diesel" color="primary" size="small" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleRegistration}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          size="large"
        >
          {loading ? 'Registering...' : 'Register Station'}
        </Button>
      </Box>
    </Paper>
  );

  // Render registration complete (Step 1)
  const renderRegistrationComplete = () => (
    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
      <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom color="success.main">
        Station Registered Successfully!
      </Typography>
      <Typography variant="body1" paragraph>
        Your fuel station <strong>{formData.name}</strong> has been registered in the system.
      </Typography>
      
      <Box sx={{ mt: 3, mb: 3 }}>
        <Alert severity="success" sx={{ textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>What's Next?</strong>
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Your station is now active in the system</li>
            <li>You can start scanning vehicle QR codes</li>
            <li>Process fuel transactions and manage quotas</li>
            <li>View transaction history and reports</li>
          </ul>
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/station/list')}
          startIcon={<StationIcon />}
        >
          View My Stations
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/station/scan')}
          startIcon={<CheckIcon />}
        >
          Start Scanning
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Register Fuel Station
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Register your fuel station to participate in the fuel quota management system
      </Typography>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Message Display */}
      {message && (
        <Alert 
          severity={messageType} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Step Content */}
      {activeStep === 0 && renderStationDetailsForm()}
      {activeStep === 1 && renderRegistrationComplete()}

      {/* Help Section */}
      <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Registration Requirements
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Business License
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valid business registration number from relevant authorities.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Location Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete address for customer navigation and verification.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Fuel Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select the types of fuel available at your station.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StationRegistration;