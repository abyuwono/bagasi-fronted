import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { payments } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const Membership: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPlan = 'monthly';
  const duration = selectedPlan === 'monthly' ? 1 : 12;

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create payment intent for membership
      const { clientSecret } = await payments.createMembershipIntent(duration);

      // Confirm payment with Stripe
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe!.confirmCardPayment(clientSecret);

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Refresh page to update membership status
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: { xs: '100%', sm: 600 },
        mx: 'auto',
        px: { xs: 2, sm: 0 },
        py: { xs: 2, sm: 4 }
      }}
    >
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              fontWeight: 600
            }}
          >
            Membership
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: 450,
              mx: 'auto'
            }}
          >
            Berlangganan untuk mengakses fitur lengkap jasa titip
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box mb={2}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Paket Pembeli
                </Typography>
                <Typography 
                  variant="h4" 
                  color="primary" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2rem' }
                  }}
                >
                  Rp 95.000
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  per bulan
                </Typography>
              </Box>

              <Box flexGrow={1} mb={3}>
                <List disablePadding>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Chat langsung via WhatsApp" 
                      primaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Harga lebih murah" 
                      secondary="Hemat hingga 20% dari harga regular"
                      primaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Proses lebih cepat" 
                      secondary="Prioritas dalam pemesanan dan konfirmasi"
                      primaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Perpanjangan otomatis tiap bulan" 
                      primaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    />
                  </ListItem>
                </List>
              </Box>

              {user ? (
                user.membership?.type === 'shopper' && user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? (
                  <Box>
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 2,
                        '& .MuiAlert-message': {
                          width: '100%',
                          textAlign: 'center'
                        }
                      }}
                    >
                      Membership aktif sampai{' '}
                      {new Date(user.membership.expiresAt).toLocaleDateString('id-ID')}
                    </Alert>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      display="block" 
                      textAlign="center"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Perpanjangan otomatis setiap bulan
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleSubscribe}
                      disabled={loading}
                      sx={{ 
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Berlangganan Sekarang'}
                    </Button>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      display="block" 
                      textAlign="center" 
                      mt={1}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      *Pembayaran otomatis setiap bulan
                    </Typography>
                  </Box>
                )
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Masuk untuk Berlangganan
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Dialog 
          open={!!error} 
          onClose={() => setError(null)}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>Kesalahan</DialogTitle>
          <DialogContent>
            <Typography>{error}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setError(null)}>Tutup</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Membership;
