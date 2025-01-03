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
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Link as MuiLink
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
        return 'Bisa Diambil';
      case 'in_discussion':
        return 'Sedang Diskusi';
      case 'accepted':
        return 'Dalam Proses';
      case 'shipped':
        return 'Dikirim Kurir Lokal';
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

  const getCurrency = (currency: string | undefined): Currency => {
    if (!currency) return 'AUD';
    return currency as Currency;
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
        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: theme.palette.text.secondary }}>
          Detail Produk Jastip
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={getStatusText(ad.status)}
                    sx={{ bgcolor: getStatusColor(ad.status), color: 'white', mb: 1 }}
                  />
                  <Typography
                    component={RouterLink}
                    to={ad.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="h6"
                    sx={{ 
                      display: 'block',
                      mt: 1,
                      color: theme.palette.text.primary,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {ad.productName}
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
                  alt={ad.productName}
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

              <Box sx={{ mt: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ width: '45%', pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nama Toko
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <MuiLink
                          href={ad.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {ad.merchantName || new URL(ad.productUrl).hostname}
                        </MuiLink>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Harga per Unit
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <span style={{ fontSize: '0.875rem' }}>
                            {formatCurrency(ad.productPrice, getCurrency(ad.productCurrency || ad.commission.currency))}
                          </span>
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Berat per Unit
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <span style={{ fontSize: '0.875rem' }}>{ad.productWeight.toFixed(2)}</span>
                          <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>KG</span>
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Kuantitas
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <span style={{ fontSize: '0.875rem' }}>{ad.quantity || 1}</span>
                          <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>pcs</span>
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Biaya Total
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="body2" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <span style={{ fontSize: '0.875rem' }}>
                            {formatCurrency(ad.productPrice * (ad.quantity || 1), getCurrency(ad.productCurrency || ad.commission.currency))}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            IDR {(ad.productPriceIDR * (ad.quantity || 1)).toLocaleString('id-ID')}
                          </span>
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Berat Total
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 0.4)' }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                          <span style={{ fontSize: '0.875rem' }}>
                            {(ad.totalWeight || (ad.productWeight * (ad.quantity || 1))).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>KG</span>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Box sx={{ mt: 3, bgcolor: 'primary.main', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" color="white" gutterBottom>
                    Komisi Traveler
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography color="white" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      {formatCurrency(ad.commission.idr, 'IDR')}
                    </Typography>
                    <Typography color="white" sx={{ opacity: 0.8 }}>
                      ({formatCurrency(ad.commission.native, ad.commission.currency)})
                    </Typography>
                  </Box>
                  <Typography 
                    color="white" 
                    sx={{ 
                      mt: 1, 
                      fontSize: '0.75rem', 
                      fontStyle: 'italic',
                      opacity: 0.7,
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      pt: 1
                    }}
                  >
                    Total dana yang akan dikirimkan secara otomatis senilai {formatCurrency(ad.totalAmount || (ad.productPrice * (ad.quantity || 1)), ad.commission.currency)} + {formatCurrency(ad.commission.native, ad.commission.currency)} setelah titipan telah diterima oleh pembeli
                  </Typography>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Kirim Ke
                    </Typography>
                    <Typography variant="body2">
                      {canShowFullAddress ? ad.shippingAddress.fullAddress : `${ad.shippingAddress.city}, ${ad.shippingAddress.country}`}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: '100px' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Kurir Lokal
                    </Typography>
                    <Typography variant="body2">
                      {ad.localCourier}
                    </Typography>
                  </Box>
                </Box>

                {ad.notes && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Catatan
                    </Typography>
                    <Typography variant="body2">
                      {ad.notes}
                    </Typography>
                  </Box>
                )}

                {ad.trackingNumber && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nomor Resi
                    </Typography>
                    <Typography variant="body2">
                      {ad.trackingNumber}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
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
                    {ad.status !== 'cancelled' && !['accepted', 'shipped', 'completed'].includes(ad.status) && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate(`/shopper-ads/${ad._id}/edit`)}
                          disabled={processingAction}
                          sx={{ 
                            fontWeight: 500,
                            px: 3,
                            py: 1,
                            position: 'relative',
                            minWidth: '100px',
                            minHeight: '36px'
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
                            color: 'white',
                            position: 'relative',
                            minWidth: '100px',
                            minHeight: '36px'
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
                          py: 1,
                          position: 'relative',
                          minWidth: '100px',
                          minHeight: '36px'
                        }}
                      >
                        {processingAction ? (
                          <CircularProgress
                            size={24}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                            }}
                          />
                        ) : (
                          'Bantu Beli'
                        )}
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
                          py: 1,
                          position: 'relative',
                          minWidth: '100px',
                          minHeight: '36px'
                        }}
                      >
                        {processingAction ? (
                          <CircularProgress
                            size={24}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                            }}
                          />
                        ) : (
                          'Terima Jastiper'
                        )}
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
                          py: 1,
                          position: 'relative',
                          minWidth: '100px',
                          minHeight: '36px'
                        }}
                      >
                        {processingAction ? (
                          <CircularProgress
                            size={24}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                            }}
                          />
                        ) : (
                          'Saya Sudah Terima Barang'
                        )}
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
                          color: 'white',
                          position: 'relative',
                          minWidth: '100px',
                          minHeight: '36px'
                        }}
                      >
                        {processingAction ? (
                          <CircularProgress
                            size={24}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                              color: 'white'
                            }}
                          />
                        ) : (
                          getCancelButtonText()
                        )}
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
          <Button onClick={() => setShowCancelDialog(false)} disabled={processingAction}>
            Tidak
          </Button>
          <Button
            onClick={handleCancel}
            color="error"
            disabled={processingAction}
            sx={{ position: 'relative' }}
          >
            {processingAction ? (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            ) : (
              'Ya'
            )}
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
