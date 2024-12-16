import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { payments, auth } from '../services/api';
import stripeLogo from '../assets/images/stripe.png';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PaymentForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const selectedPlan = 'monthly';
  const duration = selectedPlan === 'monthly' ? 1 : 12;
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);

      // Check if user is logged in
      if (!user) {
        console.log('User not logged in');
        onError('Silakan login terlebih dahulu');
        navigate('/login', { state: { from: '/membership' } });
        return;
      }

      // Create payment intent
      console.log('Creating payment intent...');
      try {
        const { clientSecret } = await payments.createMembershipIntent(duration);
        console.log('Payment intent created');

        // Get card element
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        console.log('Confirming payment...');
        // Confirm payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: user.email,
                name: user.username,
              },
            },
          }
        );

        if (stripeError) {
          console.error('Payment failed:', stripeError);
          throw new Error(stripeError.message);
        }

        if (paymentIntent?.status === 'succeeded') {
          console.log('Payment successful');
          onSuccess();
        } else {
          console.error('Payment not successful:', paymentIntent);
          throw new Error('Pembayaran gagal. Silakan coba lagi.');
        }
      } catch (err: any) {
        console.error('Payment processing error:', err);
        if (err?.response?.status === 403 && err?.response?.data?.message === 'Account is deactivated') {
          localStorage.removeItem('token');
          onError('Akun Anda belum aktif. Silakan hubungi admin untuk mengaktifkan akun.');
          navigate('/login');
        } else if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem('token');
          onError('Sesi Anda telah berakhir. Silakan login kembali.');
          navigate('/login', { state: { from: '/membership' } });
        } else {
          onError(err.message || 'Terjadi kesalahan saat memproses pembayaran');
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      onError(error.message || 'Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || loading}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Berlangganan Sekarang'
        )}
      </Button>
    </form>
  );
};

const Membership: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const { price } = await payments.getMembershipPrice();
        setPrice(price);
      } catch (err) {
        console.error('Error fetching price:', err);
        setError('Gagal memuat harga membership');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  const handleSuccess = () => {
    setSuccess(true);
    // Refresh page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Silakan login terlebih dahulu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/login'}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>
    );
  }

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
          <Box mt={3}>
            {loading ? (
              <CircularProgress size={24} />
            ) : price ? (
              <>
                <Typography variant="h3" color="primary" gutterBottom>
                  {formatPrice(price)}
                  <Typography component="span" variant="h6" color="text.secondary">
                    /bulan
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  *Berlangganan otomatis diperpanjang setiap bulan
                </Typography>
              </>
            ) : null}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Pembayaran berhasil! Halaman akan dimuat ulang...
          </Alert>
        )}

        <Elements stripe={stripePromise}>
          <PaymentForm onSuccess={handleSuccess} onError={handleError} />
        </Elements>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Keuntungan Member:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Akses ke semua fitur jasa titip"
                secondary="Fitur lengkap untuk memudahkan transaksi Anda" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Prioritas dukungan pelanggan"
                secondary="Dapatkan bantuan lebih cepat dari tim support kami" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Badge khusus member"
                secondary="Tampilkan badge eksklusif di profil Anda" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Notifikasi traveller baru"
                secondary="Dapatkan notifikasi saat ada traveller baru di kota tujuan Anda" 
              />
            </ListItem>
          </List>
        </Box>

        <Box mt={4} textAlign="center" sx={{ opacity: 0.7 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pembayaran aman diproses oleh
          </Typography>
          <Box sx={{ mt: 0.2, mb: 0.2 }}>
            <img 
              src={stripeLogo}
              alt="Powered by Stripe" 
              style={{ 
                height: '120px',
                opacity: 0.75
              }} 
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Membership;
