import React, { useState } from 'react';
import { 
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  LocalGasStation as GasStationIcon,
  DirectionsCar as CarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Eco as EcoIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f57c00',
    },
  },
});

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Form validation
    if (!username || !password) {
      setMessage('Username and password are required');
      setLoading(false);
      return;
    }

    AuthService.login(username, password).then(
      () => {
        // Get user info
        const user = AuthService.getCurrentUser();
        
        // Redirect based on user role
        if (user.roles.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else if (user.roles.includes('ROLE_STATION_OWNER')) {
          navigate('/station');
        } else {
          navigate('/vehicle');
        }
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage || 'Invalid username or password');
      }
    );
  };

  const features = [
    {
      icon: <GasStationIcon sx={{ fontSize: 24, color: 'primary.main' }} />,
      title: 'Station Management',
      description: 'Efficiently manage fuel stations'
    },
    {
      icon: <CarIcon sx={{ fontSize: 24, color: 'secondary.main' }} />,
      title: 'Vehicle Tracking',
      description: 'Monitor vehicle fuel consumption'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 24, color: 'success.main' }} />,
      title: 'Secure Access',
      description: 'Role-based access control'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 24, color: 'info.main' }} />,
      title: 'Analytics',
      description: 'Comprehensive reporting'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        
        {/* Left side - Brand and Features */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            height: '100vh',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.1)',
              zIndex: 1
            }
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              zIndex: 1
            }}
          />

          <Box sx={{ zIndex: 2, textAlign: 'center', maxWidth: 450, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Logo and Brand */}
            <Box sx={{ mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  mb: 1,
                  mx: 'auto',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <GasStationIcon sx={{ fontSize: 26 }} />
              </Avatar>
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 0.3, lineHeight: 1.2 }}>
                Fuel Quota Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.9rem' }}>
                Streamline fuel distribution and quota management
              </Typography>
            </Box>

            {/* Features Grid - More Compact */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              {features.map((feature, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      height: 100,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        background: 'rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Box sx={{ mb: 0.3 }}>
                        {React.cloneElement(feature.icon, { sx: { fontSize: 24, color: 'inherit' } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.3, fontSize: '0.7rem', lineHeight: 1.1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.1, fontSize: '0.6rem' }}>
                        {feature.description.split(' ').slice(0, 5).join(' ')}...
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Stats - More Compact */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', opacity: 0.9 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>500+</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Stations</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>10K+</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Vehicles</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>99.9%</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Uptime</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right side - Login form */}
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              px: 4,
              py: 2
            }}
          >
            <Avatar sx={{ mb: 2, bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Avatar>
            
            <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
              Welcome Back
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Please sign in to your account to continue
            </Typography>

            <Box component="form" noValidate onSubmit={handleLogin} sx={{ width: '100%', maxWidth: 420 }}>
              {message && (
                <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.9rem' }}>
                  {message}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2.5 }}
                size="medium"
                InputProps={{
                  style: { fontSize: '1rem' }
                }}
                InputLabelProps={{
                  style: { fontSize: '1rem' }
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                size="medium"
                InputProps={{
                  style: { fontSize: '1rem' }
                }}
                InputLabelProps={{
                  style: { fontSize: '1rem' }
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 1, 
                  mb: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link href="/register" variant="body2" sx={{ textDecoration: 'none', fontSize: '0.95rem' }}>
                  Don't have an account? <strong>Sign Up</strong>
                </Link>
              </Box>
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ mt: 'auto', opacity: 0.7, fontSize: '0.8rem' }}
            >
              © {new Date().getFullYear()} Fuel Quota Management System
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}