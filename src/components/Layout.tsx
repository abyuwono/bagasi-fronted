import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <Box
              component={Link}
              to="/"
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'inherit',
                alignItems: 'flex-start'
              }}
              spacing={0}
            >
              <Typography variant="h6">
                Bagasi
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  marginTop: '-8px !important',
                  letterSpacing: '0.5px'
                }}
              >
                Marketplace
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {user ? (
                <>
                  {user.role === 'traveler' ? (
                    <Box>
                      Buka JasTip
                    </Box>
                  ) : (
                    <Box>
                      Membership
                    </Box>
                  )}
                  <Box>
                    Profil
                  </Box>
                  <Box
                    onClick={handleLogout}
                  >
                    Keluar
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    component={Link}
                    to="/login"
                  >
                    Masuk
                  </Box>
                  <Box
                    component={Link}
                    to="/register"
                  >
                    Daftar
                  </Box>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
