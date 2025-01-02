import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../services/api';
import { ShopperAd } from '../types';

interface Props {
  travelerId: string;
}

const TravelerShopperAds: React.FC<Props> = ({ travelerId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<ShopperAd[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        if (!travelerId) {
          setError('No traveler ID provided');
          setLoading(false);
          return;
        }
        console.log('Fetching ads for traveler:', travelerId);
        const response = await api.get(`/shopper-ads/traveler/${travelerId}`);
        setAds(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching traveler shopper ads:', err);
        setError(err.response?.data?.message || 'Failed to load shopper ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [travelerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (ads.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Belum ada permintaan jastip yang diambil
      </Alert>
    );
  }

  return (
    <Grid container spacing={2}>
      {ads.map((ad) => (
        <Grid item xs={12} key={ad._id}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Link href={ad.productUrl} target="_blank" rel="noopener noreferrer">
                      {ad.productUrl}
                    </Link>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={ad.status}
                      color={
                        ad.status === 'completed'
                          ? 'success'
                          : ad.status === 'cancelled'
                          ? 'error'
                          : 'primary'
                      }
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Shopper: {ad.user.username}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TravelerShopperAds;
