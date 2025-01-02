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
  Button,
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
    console.log('TravelerShopperAds mounted with travelerId:', travelerId);
    console.log('TravelerShopperAds travelerId type:', typeof travelerId);
    console.log('TravelerShopperAds travelerId length:', travelerId?.length);

    const fetchAds = async () => {
      if (!travelerId) {
        console.error('No traveler ID provided. Value:', travelerId);
        setError('No traveler ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching ads for traveler:', travelerId);
        const response = await api.get(`/shopper-ads/traveler/${travelerId}`);
        console.log('Fetched ads response:', response.data);
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
        <Grid item xs={12} key={ad.id}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box
                    component="img"
                    src={ad.cloudflareImageUrl || ad.productImage}
                    alt={`Product from ${ad.user.username}`}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography variant="h6" gutterBottom>
                    {ad.user.username}'s Request
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Product Weight: {ad.productWeight} kg
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Product Price: IDR {ad.productPriceIDR.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Commission: IDR {ad.commission.idr.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    From {ad.departureCity} to {ad.arrivalCity}
                  </Typography>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/shopper-ads/${ad.id}`}
                    >
                      View Details
                    </Button>
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
