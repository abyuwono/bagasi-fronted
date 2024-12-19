import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Alert,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { adminApi } from '../../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  whatsappNumber: string;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleActiveToggle = async (userId: string) => {
    try {
      const response = await adminApi.toggleUserActive(userId);
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActive: response.isActive } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleVerificationToggle = async (userId: string) => {
    try {
      const response = await adminApi.toggleUserVerification(userId);
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isVerified: response.isVerified } : user
      ));
    } catch (err) {
      setError('Failed to update user verification');
    }
  };

  const handleWhatsappEdit = (user: User) => {
    setEditingUser(user);
    setWhatsappNumber(user.whatsappNumber);
  };

  const handleWhatsappSave = async () => {
    if (!editingUser) return;

    try {
      const response = await adminApi.updateUserWhatsapp(editingUser._id, { whatsappNumber });
      setUsers(users.map(user =>
        user._id === editingUser._id ? { ...user, whatsappNumber } : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update WhatsApp number');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Management</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>WhatsApp Number</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Reviews</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.whatsappNumber}</TableCell>
                <TableCell>{user.rating}</TableCell>
                <TableCell>{user.totalReviews || 0}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.isActive}
                    onChange={() => handleActiveToggle(user._id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.isVerified || false}
                    onChange={() => handleVerificationToggle(user._id)}
                    color="success"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleWhatsappEdit(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}>
        <DialogTitle>Edit WhatsApp Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="WhatsApp Number"
            type="text"
            fullWidth
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingUser(null)}>Cancel</Button>
          <Button onClick={handleWhatsappSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
