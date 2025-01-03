import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { formatCurrency } from '../utils/format';
import ChatRoom from '../components/ChatRoom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Commission, Currency, ShopperAd } from '../types';

const ShopperAdDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [ad, setAd] = useState<ShopperAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await api.get(`/shopper-ads/${id}`);
        setAd(response.data);
      } catch (err) {
        console.error('Error fetching ad:', err);
        setError('Failed to load ad details');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  const handleRequestHelp = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/shopper-ads/${id}` } });
      return;
    }
    if (user.role !== 'traveler') {
      toast.error('Anda harus login sebagai traveler untuk membantu membeli');
      return;
    }
    try {
      setProcessingAction(true);
      const response = await api.post(`/shopper-ads/${id}/request`);
      setAd(prev => prev ? {
        ...response.data,
        status: 'in_discussion',
        selectedTraveler: {
          id: user?.id || '',
          username: user?.username || ''
        }
      } : null);
      setShowChat(true);
      toast.success('Request sent successfully!');
    } catch (err) {
      console.error('Error requesting help:', err);
      toast.error('Failed to send request');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAcceptTraveler = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/shopper-ads/${id}/accept-traveler`);
      setAd(prev => prev ? { ...prev, status: 'accepted' } : null);
      setShowAcceptDialog(false);
      toast.success('Traveler accepted successfully!');
    } catch (err) {
      console.error('Error accepting traveler:', err);
      toast.error('Failed to accept traveler');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessingAction(true);
      const response = await api.patch(`/shopper-ads/${id}/cancel`);
      
      // Update the ad state based on the response
      setAd(prev => {
        if (!prev) return null;
        
        const isUserShopper = user?.id === prev.user.id;
        const isActiveStatus = prev.status === 'active';
        
        // If shopper cancels active ad, it becomes cancelled
        if (isUserShopper && isActiveStatus) {
          return { ...prev, status: 'cancelled' };
        }
        
        // For all other cases (traveler cancel or shopper reject), ad goes back to active
        return { 
          ...prev, 
          status: 'active',
          selectedTraveler: null
        };
      });
      
      setShowCancelDialog(false);
      toast.success(response.data.message);
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Failed to cancel order');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleComplete = async () => {
    try {
      setProcessingAction(true);
      await api.patch(`/shopper-ads/${id}/complete`);
      setAd(prev => prev ? { ...prev, status: 'completed' } : null);
      toast.success('Order marked as completed!');
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Failed to complete order');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'in_discussion':
        return theme.palette.warning.main;
      case 'accepted':
        return theme.palette.info.main;
      case 'shipped':
        return theme.palette.primary.main;
      case 'completed':
        return theme.palette.success.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Tersedia';
      case 'in_discussion':
        return 'Sedang Diskusi';
      case 'accepted':
        return 'Dalam Proses';
      case 'shipped':
        return 'Dikirim';
      case 'completed':
        return 'Selesai';
      default:
        return 'Dibatalkan';
    }
  };

  const getCancelButtonText = () => {
    if (!ad) return '';
    
    const isUserShopper = user?.id === ad.user.id;
    
    if (isUserShopper) {
      if (ad.status === 'active') return 'Batalkan Permanen';
      if (ad.status === 'in_discussion') return 'Tolak Traveler';
      return '';
    }
    
    // For travelers
    if (['in_discussion', 'accepted', 'shipped'].includes(ad.status)) {
      return 'Batalkan Order';
    }
    
    return '';
  };

  const showCancelButton = () => {
    if (!ad || !user) return false;
    
    const isUserShopper = user.id === ad.user.id;
    const isUserTraveler = user.id === ad?.selectedTraveler?.id;
    
    if (isUserShopper) {
      return ['active', 'in_discussion'].includes(ad.status);
    }
    
    if (isUserTraveler) {
      return ['in_discussion', 'accepted', 'shipped'].includes(ad.status);
    }
    
    return false;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ad) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Ad not found'}</Alert>
      </Container>
    );
  }

  const isUserShopper = user?.id === ad.user.id;
  const isUserTraveler = user?.id === ad?.selectedTraveler?.id;
  const canShowFullAddress = ad.status === 'accepted' && isUserTraveler;

  return (
    <>
      <Helmet>
        <title>{`Jastip ${ad.user.username} - ${ad.productUrl} - Bagasi`}</title>
        <meta
          name="description"
          content={`Jastip untuk ${ad.productUrl} oleh ${ad.user.username}. Bagasi - Platform jastip terpercaya untuk membeli barang dari luar negeri.`}
        />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Chip
                    label={getStatusText(ad.status)}
                    sx={{ bgcolor: getStatusColor(ad.status), color: 'white', mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Detail Permintaan Produk
                  </Typography>
                </Box>
                {ad.selectedTraveler && (
                  <Typography variant="subtitle2" color="text.secondary">
                    Jastiper: {ad.selectedTraveler.username}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <img
                  src={ad.cloudflareImageUrl || ad.productImage}
                  alt="Product"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('placeholder')) {
                      img.src = 'https://placehold.co/400x400?text=Image+Not+Available';
                    }
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    component="a"
                    href={ad.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '1.1rem',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    {ad.productUrl.includes('blackmores') ? 'Blackmores Omega Triple Super Strength Fish Oil 150 Capsules' : ad.productUrl.split('/').pop() || 'Lihat Produk'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Harga Barang:
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem' }}>
                    {formatCurrency(ad.productPrice, ad.commission.currency)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Berat Total:
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem' }}>
                    {Math.max(0.1, ad.productWeight / 1000)} KG
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Komisi:
                  </Typography>
                  <Typography color="primary" sx={{ fontSize: '1.1rem' }}>
                    {formatCurrency(ad.commission.idr, 'IDR')}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    ({formatCurrency(ad.commission.native, ad.commission.currency)})
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Alamat Pengiriman:
                  </Typography>
                  <Typography>
                    {canShowFullAddress ? ad.shippingAddress.fullAddress : (
                      `${ad.shippingAddress.city}, ${ad.shippingAddress.country}`
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Kurir Lokal:
                  </Typography>
                  <Typography>{ad.localCourier}</Typography>
                </Grid>

                {ad.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                      Catatan:
                    </Typography>
                    <Typography>{ad.notes}</Typography>
                  </Grid>
                )}

                {ad.trackingNumber && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                      Nomor Resi:
                    </Typography>
                    <Typography>{ad.trackingNumber}</Typography>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                {isUserShopper ? (
                  <>
                    <Box 
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '16px',
                        px: 2,
                        py: 0.75,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}
                      >
                        Kamu pemilik order jastip ini
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    {!['accepted', 'shipped', 'completed', 'cancelled'].includes(ad.status) && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate(`/shopper-ads/${ad._id}/edit`)}
                          disabled={processingAction}
                          sx={{ 
                            fontWeight: 500,
                            px: 3,
                            py: 1
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={processingAction}
                          sx={{ 
                            fontWeight: 500,
                            px: 3,
                            py: 1,
                            color: 'white'
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {ad.status === 'active' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRequestHelp}
                        disabled={processingAction}
                        sx={{ 
                          fontWeight: 500,
                          px: 3,
                          py: 1
                        }}
                      >
                        Bantu Beli
                      </Button>
                    )}

                    {ad.status === 'in_discussion' && isUserShopper && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowAcceptDialog(true)}
                        disabled={processingAction}
                        sx={{ 
                          fontWeight: 500,
                          px: 3,
                          py: 1
                        }}
                      >
                        Terima Jastiper
                      </Button>
                    )}

                    {ad.status === 'shipped' && isUserShopper && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleComplete}
                        disabled={processingAction}
                        sx={{ 
                          fontWeight: 500,
                          px: 3,
                          py: 1
                        }}
                      >
                        Saya Sudah Terima Barang
                      </Button>
                    )}

                    {showCancelButton() && !isUserShopper && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={processingAction}
                        sx={{ 
                          fontWeight: 500,
                          px: 3,
                          py: 1,
                          color: 'white'
                        }}
                      >
                        {getCancelButtonText()}
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {user && (isUserShopper ||
           (isUserTraveler && ad.selectedTraveler?.id === user?.id && ad.status !== 'cancelled')) && (
            <Grid item xs={12} md={4}>
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Chat
                </Typography>
                <ChatRoom adId={ad._id} />
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
      >
        <DialogTitle>
          {user?.id === ad.user.id && ad.status === 'active' 
            ? 'Batalkan Permanen?' 
            : 'Batalkan Order?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {user?.id === ad.user.id && ad.status === 'active' ? (
              <>
                <p>Kamu yakin ingin membatalkan iklan Jastip ini secara permanen?</p>
                <p>
                  Kamu akan mendapatkan pengembalian dana sebesar{' '}
                  <strong>
                    Rp {(ad.productPriceIDR + ad.commission.idr).toLocaleString()}
                  </strong>{' '}
                  (Harga barang + Komisi untuk traveller).
                </p>
                <p style={{ color: '#666', fontSize: '0.9em', marginTop: '8px' }}>
                  *Refund akan diproses paling lama 14 hari kerja
                </p>
              </>
            ) : user?.id === ad.user.id
              ? 'Kamu yakin ingin menolak traveler ini? Iklan akan kembali aktif.'
              : 'Kamu yakin ingin membatalkan order ini? Banyak pembatalan dapat mengakibatkan akun dinonaktifkan.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Tidak</Button>
          <Button
            onClick={handleCancel}
            color="error"
            disabled={processingAction}
          >
            Ya, Batalkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onClose={() => setShowAcceptDialog(false)}>
        <DialogTitle>Konfirmasi Penerimaan</DialogTitle>
        <DialogContent>
          Apakah Anda yakin ingin menerima jastiper ini?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAcceptDialog(false)}>Tidak</Button>
          <Button onClick={handleAcceptTraveler} color="primary" disabled={processingAction}>
            Ya, Terima
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShopperAdDetails;
