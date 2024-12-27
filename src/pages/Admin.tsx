import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { adminApi } from '../services/api';
import UserManagement from '../components/admin/UserManagement';
import AdManagement from '../components/admin/AdManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Hash the password with bcrypt
      const salt = '$2a$10$7UF3RvDx9h5KKYs1bkUFo.';
      const hashedPassword = await bcrypt.hashSync(password, salt);
      const response = await adminApi.login({ username, password: hashedPassword });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAdmin', 'true');
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Admin Login
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              sx={{ mt: 2 }}
            >
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                sx={{ mt: 3 }}
                type="submit"
              >
                Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="User Management" />
            <Tab label="Ad Management" />
          </Tabs>
          <TabPanel value={activeTab} index={0}>
            <UserManagement />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AdManagement />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Admin;
