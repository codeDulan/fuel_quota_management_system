// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  LocalGasStation as StationIcon,
  DirectionsCar as VehicleIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';
import { UserProfileService } from '../services/ApiService'; // Import the real service
import { ValidationUtils } from '../utils';

const UserProfile = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile form data
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Password form data
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await UserProfileService.getCurrentProfile();
      setProfile(response.data);
      setProfileForm({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      NotificationService.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset form
      setProfileForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || ''
      });
      setErrors({});
    }
    setEditMode(!editMode);
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    // Validate full name
    if (!profileForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Validate email
    const emailValidation = ValidationUtils.validateEmail(profileForm.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Validate phone number (optional but must be valid if provided)
    if (profileForm.phoneNumber && profileForm.phoneNumber.trim()) {
      const phoneValidation = ValidationUtils.validatePhoneNumber(profileForm.phoneNumber);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data for API call
      const updateData = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber ? profileForm.phoneNumber.trim() : null
      };

      await UserProfileService.updateProfile(updateData);
      
      // Update local profile data
      setProfile(prev => ({ ...prev, ...updateData }));
      setEditMode(false);
      NotificationService.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      NotificationService.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordValidation = ValidationUtils.validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    return newErrors;
  };

  const handleChangePassword = async () => {
    const passwordErrors = validatePasswordForm();
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    try {
      setChangingPassword(true);
      await UserProfileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      NotificationService.success('Password changed successfully!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please check your current password.';
      setErrors({ currentPassword: errorMessage });
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getRoleIcon = (roles) => {
    if (roles?.includes('ROLE_ADMIN')) return <AdminIcon />;
    if (roles?.includes('ROLE_STATION_OWNER')) return <StationIcon />;
    if (roles?.includes('ROLE_VEHICLE_OWNER')) return <VehicleIcon />;
    return <PersonIcon />;
  };

  const getPrimaryRole = (roles) => {
    if (roles?.includes('ROLE_ADMIN')) return 'Administrator';
    if (roles?.includes('ROLE_STATION_OWNER')) return 'Station Owner';
    if (roles?.includes('ROLE_VEHICLE_OWNER')) return 'Vehicle Owner';
    return 'User';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'error';
      case 'ROLE_STATION_OWNER': return 'success';
      case 'ROLE_VEHICLE_OWNER': return 'info';
      default: return 'default';
    }
  };

  const formatRoleDisplayName = (role) => {
    return role.replace('ROLE_', '').replace('_', ' ');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account information and settings
        </Typography>
      </Box>

      {/* Profile Information Card */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 3, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {profile?.fullName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {profile?.fullName || profile?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  @{profile?.username}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profile?.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={formatRoleDisplayName(role)}
                      size="small"
                      color={getRoleColor(role)}
                      icon={getRoleIcon([role])}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Change Password">
                <IconButton
                  onClick={() => setPasswordDialogOpen(true)}
                  color="primary"
                >
                  <LockIcon />
                </IconButton>
              </Tooltip>
              
              <Button
                variant={editMode ? "outlined" : "contained"}
                startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                disabled={saving}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
              
              {editMode && (
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Profile Form */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) => handleProfileFormChange('fullName', e.target.value)}
                disabled={!editMode}
                error={!!errors.fullName}
                helperText={errors.fullName}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) => handleProfileFormChange('email', e.target.value)}
                disabled={!editMode}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileForm.phoneNumber}
                onChange={(e) => handleProfileFormChange('phoneNumber', e.target.value)}
                disabled={!editMode}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber || 'Format: +94771234567'}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={profile?.username || ''}
                disabled
                helperText="Username cannot be changed"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SuccessIcon sx={{ mr: 1 }} />
            Account Information
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="Account Type"
                secondary={getPrimaryRole(profile?.roles || [])}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText
                primary="Member Since"
                secondary={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText
                primary="Last Updated"
                secondary={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'N/A'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => {
          setPasswordDialogOpen(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon sx={{ mr: 1 }} />
            Change Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('current')}>
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
              error={!!errors.newPassword}
              helperText={errors.newPassword || 'Minimum 6 characters with letters and numbers'}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('new')}>
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPasswordDialogOpen(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <LockIcon />}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
export default UserProfile;