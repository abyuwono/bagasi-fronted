import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { payments } from '../services/api';

// Import SVG logo
import stripeLogo from '../assets/svg/stripe.svg';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

// Fixed price for ad posting (IDR 195,000)
const AD_POSTING_PRICE = 195000;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface AdPaymentProps {
  adTitle: string;
  flightDate: string;
}

const PaymentForm = ({ adTitle, flightDate }: AdPaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create payment intent
      const { clientSecret } = await payments.createAdPostingIntent();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

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
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        navigate('/ads/payment-success');
      } else {
        throw new Error('Payment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Pembayaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Bayar Buka Jasa Titip Baru
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Detail Pembayaran:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="bold">
                {adTitle}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" fontStyle="italic">
                {formatDate(flightDate)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" color="primary">
                {formatPrice(AD_POSTING_PRICE)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kartu Debit / Kredit:
            </Typography>
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
              `Bayar ${formatPrice(AD_POSTING_PRICE)}`
            )}
          </Button>
        </form>

        <Box mt={2} textAlign="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Pembayaran aman menggunakan Stripe
          </Typography>
          <Box mt={0.3}>
            <img src={stripeLogo} alt="Powered by Stripe" style={{ height: 72, opacity: 0.75 }} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

const AdPayment = () => {
  const location = useLocation();
  const { adTitle, flightDate } = location.state as AdPaymentProps;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm adTitle={adTitle} flightDate={flightDate} />
    </Elements>
  );
};

export default AdPayment;
