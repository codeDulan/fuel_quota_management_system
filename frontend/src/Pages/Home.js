import React from 'react';
import {
  Button,
  CssBaseline,
  Stack,
  Box,
  Typography,
  Container,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const theme = createTheme();

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              <LocalGasStationIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
              Fuel Quota System
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              A comprehensive system to manage fuel distribution during the crisis.
              Register your vehicle or fuel station to get started.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/login"
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/register"
              >
                Register
              </Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* Features */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Vehicle Owners */}
            <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
              <Typography component="h2" variant="h5" color="primary" gutterBottom>
                For Vehicle Owners
              </Typography>
              <Typography paragraph>
                Register your vehicle details and get a unique QR code to access your fuel quota.
                Track your remaining quota and transactions.
              </Typography>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/register" 
                size="small"
              >
                Register Vehicle
              </Button>
            </Paper>
            
            {/* Fuel Station Owners */}
            <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
              <Typography component="h2" variant="h5" color="primary" gutterBottom>
                For Fuel Station Owners
              </Typography>
              <Typography paragraph>
                Register your fuel station to participate in the quota system.
                Scan vehicle QR codes and track fuel distribution at your station.
              </Typography>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/register" 
                size="small"
              >
                Register Station
              </Button>
            </Paper>
          </Box>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Fuel Quota Management System
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Efficiently managing fuel distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Copyright © {new Date().getFullYear()}
        </Typography>
      </Box>
    </ThemeProvider>
  );
}