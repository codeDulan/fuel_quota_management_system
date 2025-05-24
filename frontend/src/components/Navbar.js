// src/components/Navbar.js (Corrected routes)
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const Navbar = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User menu state
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
    handleCloseUserMenu();
  };

  // Get user's primary role for display
  const getUserRole = () => {
    if (!currentUser || !currentUser.roles) return null;
    if (currentUser.roles.includes('ROLE_ADMIN')) return 'Admin';
    if (currentUser.roles.includes('ROLE_STATION_OWNER')) return 'Station Owner';
    if (currentUser.roles.includes('ROLE_VEHICLE_OWNER')) return 'Vehicle Owner';
    return 'User';
  };

  // Determine which pages to show based on user role
  let pages = [{ title: 'Home', path: '/' }];
  
  if (currentUser) {
    if (currentUser.roles.includes('ROLE_ADMIN')) {
      pages.push({ title: 'Dashboard', path: '/admin' });
      pages.push({ title: 'Users', path: '/admin/users' });
      pages.push({ title: 'Stations', path: '/admin/stations' });
      pages.push({ title: 'Vehicles', path: '/admin/vehicles' });
    } else if (currentUser.roles.includes('ROLE_STATION_OWNER')) {
      pages.push({ title: 'Dashboard', path: '/station' });
    } else if (currentUser.roles.includes('ROLE_VEHICLE_OWNER')) {
      pages.push({ title: 'Dashboard', path: '/vehicle' });

    }
  }

  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <LocalGasStationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Fuel Quota System
      </Typography>
      <Divider />
      
      {/* User info in mobile drawer */}
      {currentUser && (
        <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
          <Typography variant="body2" color="text.secondary">
            Logged in as
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {currentUser.username}
          </Typography>
          <Chip 
            label={getUserRole()} 
            size="small" 
            color="primary" 
            sx={{ mt: 0.5 }} 
          />
        </Box>
      )}
      
      <List>
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={page.path}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Mobile logout button */}
        {currentUser && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ textAlign: 'center' }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <LocalGasStationIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              FUEL QUOTA
            </Typography>

            {/* Mobile menu button */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Logo for mobile */}
            <LocalGasStationIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              FUEL QUOTA
            </Typography>
            
            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              {currentUser ? (
                <>
                  {/* User role chip (desktop only) */}
                  <Chip 
                    label={getUserRole()} 
                    size="small" 
                    sx={{ 
                      mr: 2, 
                      display: { xs: 'none', md: 'inline-flex' },
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }} 
                  />
                  
                  <Tooltip title="Account settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt={currentUser.username.toUpperCase()}
                        sx={{ 
                          bgcolor: 'secondary.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {currentUser.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {/* User info in dropdown */}
                    <MenuItem disabled>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Signed in as
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {currentUser.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentUser.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    
                    {/* Quick navigation based on role */}
                    {currentUser.roles.includes('ROLE_ADMIN') && (
                      <MenuItem 
                        component={RouterLink} 
                        to="/admin" 
                        onClick={handleCloseUserMenu}
                      >
                        <Typography>Admin Dashboard</Typography>
                      </MenuItem>
                    )}
                    
                    {currentUser.roles.includes('ROLE_STATION_OWNER') && (
                      <MenuItem 
                        component={RouterLink} 
                        to="/station" 
                        onClick={handleCloseUserMenu}
                      >
                        <Typography>Station Dashboard</Typography>
                      </MenuItem>
                    )}
                    
                    {currentUser.roles.includes('ROLE_VEHICLE_OWNER') && (
                      <MenuItem 
                        component={RouterLink} 
                        to="/vehicle" 
                        onClick={handleCloseUserMenu}
                      >
                        <Typography>Vehicle Dashboard</Typography>
                      </MenuItem>
                    )}
                    
                    <Divider />
                    <MenuItem 
                      component={RouterLink} 
                      to="/profile" 
                      onClick={handleCloseUserMenu}
                    >
                      <Typography>Profile Settings</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography color="error">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex' }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ 
                      color: 'white', 
                      mx: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white', 
                      mx: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;