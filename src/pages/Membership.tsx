import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { payments } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const PaymentForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const selectedPlan = 'monthly';
  const duration = selectedPlan === 'monthly' ? 1 : 12;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);

      // Create payment intent
      const { clientSecret } = await payments.createMembershipIntent(duration);

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Add billing details if needed
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        throw new Error('Payment failed');
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
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
              <ListItemText primary="Akses ke semua fitur jasa titip" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText primary="Prioritas dukungan pelanggan" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText primary="Badge khusus member" />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default Membership;
