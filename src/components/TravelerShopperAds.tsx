import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  useTheme,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShopperAd } from '../types';
import { formatCurrency } from '../utils/format';

interface TravelerShopperAdsProps {
  travelerId: string;
}

const TravelerShopperAds: React.FC<TravelerShopperAdsProps> = ({ travelerId }) => {
  const [ads, setAds] = useState<ShopperAd[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (!travelerId || !/^[0-9a-fA-F]{24}$/.test(travelerId)) {
          console.error('Invalid traveler ID format');
          setLoading(false);
          return;
        }
        const response = await api.get(`/shopper-ads/traveler/${travelerId}`);
        setAds(response.data);
      } catch (err) {
        console.error('Error fetching traveler shopper ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [travelerId]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (ads.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Belum ada permintaan jastip yang diambil
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {ads.map((ad) => (
        <Grid item xs={12} key={ad._id}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Chip
                  label={getStatusText(ad.status)}
                  sx={{ bgcolor: getStatusColor(ad.status), color: 'white', mb: 1 }}
                />
                <Typography
                  component="a"
                  href={ad.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                    display: 'block',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {ad.productUrl.split('/').pop() || 'Lihat Produk'}
                </Typography>
              </Box>
              <Button
                component={Link}
                to={`/shopper-ads/${ad._id}`}
                variant="outlined"
                size="small"
              >
                Lihat Detail
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Pembeli:
                </Typography>
                <Typography>{ad.user.username}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Komisi:
                </Typography>
                <Typography color="primary">
                  {formatCurrency(ad.commission.idr, 'IDR')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({formatCurrency(ad.commission.native, ad.commission.currency)})
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TravelerShopperAds;
