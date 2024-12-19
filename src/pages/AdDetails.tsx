import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Tooltip,
} from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { ads } from '../services/api';
import { Ad } from '../types';
import RandomAvatar from '../components/RandomAvatar';
import VerificationBadge from '../components/VerificationBadge';
import FormattedNotes from '../components/FormattedNotes';
import { generateAdUrl } from '../utils/url';

const monthsInIndonesian = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const formatDateInIndonesian = (date: Date) => {
  const day = format(date, 'dd');
  const month = monthsInIndonesian[date.getMonth()];
  const year = format(date, 'yyyy');
  return `${day} ${month} ${year}`;
};

const AdDetails = () => {
  const { id, slug, date } = useParams<{ id: string; slug?: string; date?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [bookingWeight, setBookingWeight] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await ads.getById(id!);
        setAd(response);
        
        if (response) {
          const currentPath = window.location.pathname;
          const expectedPath = generateAdUrl(response);
          
          // Redirect if URL doesn't match expected format
          if (currentPath !== expectedPath && !currentPath.match(/^\/ads\/[^\/]+$/)) {
            navigate(expectedPath, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        setError('Ad not found');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id, navigate]);

  const handleBookingSubmit = async () => {
    try {
      if (!ad || !user) return;

      const weight = parseFloat(bookingWeight);
      if (isNaN(weight) || weight <= 0 || weight > ad.availableWeight) {
        setBookingError('Silakan masukkan berat yang valid');
        return;
      }

      await ads.book(ad._id, { weight });
      setBookingDialogOpen(false);
      setShowContact(true);
    } catch (err) {
      setBookingError('Gagal memesan. Silakan coba lagi nanti.');
    }
  };

  const displayName = ad?.customDisplayName || ad?.user?.username || 'Anonymous';
  const rating = ad?.customRating !== undefined ? ad.customRating : (ad?.user?.rating || 0);
  const whatsappNumber = ad?.customWhatsapp || ad?.user?.whatsappNumber;

  const handleWhatsAppClick = () => {
    if (!user?.membership?.type || !whatsappNumber) {
      setSubscriptionDialogOpen(true);
      return;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ad) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error || 'Iklan tidak ditemukan'}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {ad.departureCity} → {ad.arrivalCity}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {ad.currency} {ad.pricePerKg.toLocaleString()}/kg
              </Typography>
              <Typography variant="body1" gutterBottom>
                Berat Bagasi Tersedia: {ad.availableWeight} KG
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              <strong>Keberangkatan:</strong>{' '}
              {formatDateInIndonesian(new Date(ad.departureDate))}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Drop-in Terakhir:</strong>{' '}
              {formatDateInIndonesian(new Date(ad.expiresAt))}
            </Typography>

            {ad.additionalNotes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Catatan Tambahan
                </Typography>
                <FormattedNotes notes={ad.additionalNotes} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box display="flex" flexDirection="column">
                <Box display="flex" alignItems="center" mb={0.2}>
                  <Typography variant="h6">
                    {displayName}
                  </Typography>
                  {ad.user?.isVerified && (
                    <Tooltip title="ID Verified" arrow>
                      <Box ml={1}>
                        <VerificationBadge
                          sx={{
                            fontSize: '1.2rem',
                            color: '#34D399',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
                <Box display="flex" alignItems="center" mb={0.7}>
                  <Rating value={rating} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({rating.toFixed(1)})
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {user?.role === 'shopper' ? (
                user.membership?.type === 'shopper' && user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date() ? (
                  showContact ? (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<WhatsApp />}
                      onClick={handleWhatsAppClick}
                    >
                      Kirim Pesan
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setBookingDialogOpen(true)}
                    >
                      Pesan Sekarang
                    </Button>
                  )
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<WhatsApp />}
                    onClick={() => setSubscriptionDialogOpen(true)}
                  >
                    Kirim Pesan
                  </Button>
                )
              ) : user ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<WhatsApp />}
                  onClick={() => {
                    const dialog = window.confirm(
                      'Fitur ini hanya tersedia untuk akun pembeli. Silakan daftar sebagai pembeli untuk mengakses fitur ini.'
                    );
                    if (dialog) {
                      navigate('/register?role=shopper');
                    }
                  }}
                >
                  Kirim Pesan
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<WhatsApp />}
                  onClick={() => navigate('/login')}
                >
                  Masuk untuk Kirim Pesan
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)}>
        <DialogTitle>Pesan Ruang Bagasi</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Berat (KG)"
              type="number"
              value={bookingWeight}
              onChange={(e) => setBookingWeight(e.target.value)}
              error={!!bookingError}
              helperText={bookingError}
              InputProps={{
                inputProps: {
                  min: 0,
                  max: ad.availableWeight,
                  step: 0.1,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Batal</Button>
          <Button onClick={handleBookingSubmit} variant="contained" color="primary">
            Pesan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subscriptionDialogOpen} onClose={() => setSubscriptionDialogOpen(false)}>
        <DialogTitle>Berlangganan untuk Menghubungi Penjual</DialogTitle>
        <DialogContent>
          <Typography>
            Untuk menghubungi penjual, Anda perlu berlangganan dengan biaya Rp 95.000/bulan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialogOpen(false)}>Batal</Button>
          <Button 
            onClick={() => {
              setSubscriptionDialogOpen(false);
              navigate('/membership');
            }} 
            variant="contained" 
            color="primary"
          >
            Lanjutkan ke Keanggotaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdDetails;
