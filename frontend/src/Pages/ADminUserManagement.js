// src/pages/AdminUserManagement.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
  Avatar,
  TablePagination
} from '@mui/material';
import {
  People as PeopleIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  DirectionsCar as VehicleOwnerIcon,
  LocalGasStation as StationOwnerIcon
} from '@mui/icons-material';
import { AdminService } from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import { DateUtils, FormatUtils } from '../utils';

const AdminUserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoles, setEditRoles] = useState({
    ROLE_ADMIN: false,
    ROLE_STATION_OWNER: false,
    ROLE_VEHICLE_OWNER: false
  });

  // Statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    stationOwners: 0,
    vehicleOwners: 0
  });

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search term or role filter changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAllUsers();
      setUsers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      NotificationService.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const stats = {
      total: userList.length,
      admins: userList.filter(u => u.roles.includes('ROLE_ADMIN')).length,
      stationOwners: userList.filter(u => u.roles.includes('ROLE_STATION_OWNER')).length,
      vehicleOwners: userList.filter(u => u.roles.includes('ROLE_VEHICLE_OWNER')).length
    };
    setUserStats(stats);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.roles.includes(roleFilter));
    }

    setFilteredUsers(filtered);
  };

  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setEditRoles({
      ROLE_ADMIN: user.roles.includes('ROLE_ADMIN'),
      ROLE_STATION_OWNER: user.roles.includes('ROLE_STATION_OWNER'),
      ROLE_VEHICLE_OWNER: user.roles.includes('ROLE_VEHICLE_OWNER')
    });
    setEditDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    try {
      const selectedRoles = Object.keys(editRoles).filter(role => editRoles[role]);
      
      await AdminService.updateUserRoles(selectedUser.id, selectedRoles);
      NotificationService.success('User roles updated successfully!');
      
      setEditDialogOpen(false);
      loadUsers(); // Reload users
    } catch (error) {
      NotificationService.error('Failed to update user roles');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await AdminService.updateUserStatus(userId, !currentStatus);
      NotificationService.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      loadUsers(); // Reload users
    } catch (error) {
      NotificationService.error('Failed to update user status');
    }
  };

  const getRoleIcon = (roles) => {
    if (roles.includes('ROLE_ADMIN')) return <AdminIcon sx={{ fontSize: 16 }} />;
    if (roles.includes('ROLE_STATION_OWNER')) return <StationOwnerIcon sx={{ fontSize: 16 }} />;
    if (roles.includes('ROLE_VEHICLE_OWNER')) return <VehicleOwnerIcon sx={{ fontSize: 16 }} />;
    return null;
  };

  const getPrimaryRole = (roles) => {
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_STATION_OWNER')) return 'Station Owner';
    if (roles.includes('ROLE_VEHICLE_OWNER')) return 'Vehicle Owner';
    return 'User';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading users...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Tooltip title="Refresh Users">
          <IconButton onClick={loadUsers}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {userStats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Administrators
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {userStats.admins}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AdminIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Station Owners
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {userStats.stationOwners}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <StationOwnerIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Vehicle Owners
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {userStats.vehicleOwners}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <VehicleOwnerIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Users"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrators</MenuItem>
                <MenuItem value="ROLE_STATION_OWNER">Station Owners</MenuItem>
                <MenuItem value="ROLE_VEHICLE_OWNER">Vehicle Owners</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getRoleIcon(user.roles) || user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.fullName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                    {user.phoneNumber && (
                      <Typography variant="body2" color="text.secondary">
                        {user.phoneNumber}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role.replace('ROLE_', '').replace('_', ' ')}
                          size="small"
                          color={
                            role === 'ROLE_ADMIN' ? 'error' :
                            role === 'ROLE_STATION_OWNER' ? 'success' : 'info'
                          }
                        />
                      ))}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.createdAt ? DateUtils.formatTimestamp(user.createdAt) : 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Roles">
                        <IconButton
                          size="small"
                          onClick={() => handleEditRoles(user)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          color={user.isActive ? 'error' : 'success'}
                        >
                          {user.isActive ? <BlockIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Edit Roles Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User Roles - {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select the roles for this user:
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editRoles.ROLE_ADMIN}
                    onChange={(e) => setEditRoles(prev => ({ ...prev, ROLE_ADMIN: e.target.checked }))}
                    color="error"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AdminIcon sx={{ mr: 1, fontSize: 16 }} />
                    Administrator
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editRoles.ROLE_STATION_OWNER}
                    onChange={(e) => setEditRoles(prev => ({ ...prev, ROLE_STATION_OWNER: e.target.checked }))}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StationOwnerIcon sx={{ mr: 1, fontSize: 16 }} />
                    Station Owner
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editRoles.ROLE_VEHICLE_OWNER}
                    onChange={(e) => setEditRoles(prev => ({ ...prev, ROLE_VEHICLE_OWNER: e.target.checked }))}
                    color="info"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VehicleOwnerIcon sx={{ mr: 1, fontSize: 16 }} />
                    Vehicle Owner
                  </Box>
                }
              />
            </FormGroup>

            <Alert severity="warning" sx={{ mt: 2 }}>
              Be careful when modifying admin roles. Ensure at least one admin user remains active.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveRoles} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserManagement;