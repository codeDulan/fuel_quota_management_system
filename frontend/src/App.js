// src/App.js (Updated with Station Owner routes)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";

// Pages - Authentication
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";

// Pages - Vehicle Owner
import VehicleDashboard from "./pages/VehicleDashboard";
import VehicleRegistration from "./pages/VehicleRegistration";
import VehicleList from "./pages/VehicleList";
import VehicleTransactions from "./pages/VehicleTransactions";

// Pages - Station Owner
import StationDashboard from "./pages/StationDashboard";
import StationRegistration from "./pages/StationRegistration";
import StationList from "./pages/StationList";
import QRScanner from "./pages/QRScanner";
import StationTransactions from "./pages/StationTransactions";
import StationTransactionHistory from "./pages/StationTransactionHistory";

// Pages - Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminVehicleManagement from "./pages/AdminVehicleManagement";
import AdminStationManagement from "./pages/AdminStationManagement";

// Services
import AuthService from "./services/AuthService";

// Private route component
const PrivateRoute = ({ children, roles }) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  // Check if route requires specific role
  if (roles && !roles.some((role) => currentUser.roles.includes(role))) {
    // User does not have required role, redirect to appropriate dashboard
    const dashboardRoute = AuthService.getDashboardRoute();
    return <Navigate to={dashboardRoute} />;
  }

  // User is logged in and has required role, render the route
  return children;
};

// Create theme with enhanced colors for fuel quota system
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue for primary actions
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e", // Red for alerts/warnings
    },
    success: {
      main: "#2e7d32", // Green for petrol/success states
      light: "#4caf50",
      dark: "#1b5e20",
    },
    warning: {
      main: "#ed6c02", // Orange for warnings
      light: "#ff9800",
      dark: "#e65100",
    },
    info: {
      main: "#0288d1", // Light blue for diesel/info
      light: "#03a9f4",
      dark: "#01579b",
    },
    error: {
      main: "#d32f2f", // Red for errors
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // Customize Material-UI components
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Don't uppercase button text
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              AuthService.isLoggedIn() ? (
                <Navigate to={AuthService.getDashboardRoute()} />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              AuthService.isLoggedIn() ? (
                <Navigate to={AuthService.getDashboardRoute()} />
              ) : (
                <Register />
              )
            }
          />

          {/* Vehicle owner routes */}
          <Route
            path="/vehicle"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle/add"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleRegistration />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle/list"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleList />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle/quota"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleList />
              </PrivateRoute>
            }
          />
          {/* ADD THESE NEW TRANSACTION ROUTES */}
          <Route
            path="/vehicle/transactions"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleTransactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle/transactions/:vehicleId"
            element={
              <PrivateRoute roles={["ROLE_VEHICLE_OWNER"]}>
                <VehicleTransactions />
              </PrivateRoute>
            }
          />

          {/* Station owner routes - UPDATED SECTION */}
          <Route
            path="/station"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationDashboard />
              </PrivateRoute>
            }
          />

          {/* Station Registration - Add both routes */}
          <Route
            path="/station/register"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationRegistration />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/add"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationRegistration />
              </PrivateRoute>
            }
          />

          {/* Station List - Add both routes */}
          <Route
            path="/stations"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationList />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/list"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationList />
              </PrivateRoute>
            }
          />

          {/* QR Scanner - Add both routes */}
          <Route
            path="/qr-scanner"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <QRScanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/scan"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <QRScanner />
              </PrivateRoute>
            }
          />

          {/* Transactions - Add placeholder routes */}
          <Route
            path="/transactions"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationTransactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/transactions"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationTransactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/transactions/:stationId"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationTransactionHistory />
              </PrivateRoute>
            }
          />

          {/* Station Analytics/Dashboard */}
          <Route
            path="/station/:stationId/dashboard"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/station/analytics/:stationId"
            element={
              <PrivateRoute roles={["ROLE_STATION_OWNER"]}>
                <StationDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AdminUserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AdminVehicleManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stations"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AdminStationManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute roles={["ROLE_ADMIN"]}>
                <AdminReports />
              </PrivateRoute>
            }
          />

          {/* Profile route (available to all logged-in users) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  AuthService.isLoggedIn()
                    ? AuthService.getDashboardRoute()
                    : "/"
                }
              />
            }
          />
        </Routes>

        {/* Toast Notification Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
