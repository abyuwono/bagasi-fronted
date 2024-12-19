import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import AdCard from '../components/AdCard';
import { ads } from '../services/api';
import { Ad } from '../types';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adList, setAdList] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await ads.getAll();
        setAdList(data);
      } catch (err) {
        setError('Gagal memuat iklan. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const filteredAds = adList.filter(
    (ad) =>
      ad.departureCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.arrivalCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Helmet>
        <title>Bagasi - Jasa Titip Terpercaya</title>
        <meta name="description" content="Bagasi adalah platform jasa titip terpercaya yang menghubungkan traveler dengan pembeli. Temukan jasa titip dari berbagai negara dengan harga terbaik." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Bagasi - Jasa Titip Terpercaya" />
        <meta property="og:description" content="Bagasi adalah platform jasa titip terpercaya yang menghubungkan traveler dengan pembeli. Temukan jasa titip dari berbagai negara dengan harga terbaik." />
        <meta property="og:site_name" content="Bagasi" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bagasi - Jasa Titip Terpercaya" />
        <meta name="twitter:description" content="Bagasi adalah platform jasa titip terpercaya yang menghubungkan traveler dengan pembeli. Temukan jasa titip dari berbagai negara dengan harga terbaik." />
        
        {/* Additional SEO */}
        <meta name="keywords" content="jasa titip, titip barang, jastip, marketplace, travel, shopping, bagasi" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom align="center">
          Cari Jasa Titip Bagasi
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Temukan traveler yang bisa membawa barang kamu lebih murah dan cepat
        </Typography>

        <Box component="form" sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Dari Kota"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Ke Kota"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: '100%' }}
              >
                Cari
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {filteredAds.map((ad) => (
          <Grid item xs={12} sm={6} md={4} key={ad._id}>
            <AdCard ad={ad} />
          </Grid>
        ))}
        {filteredAds.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center" color="textSecondary">
              Tidak ada iklan yang ditemukan
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Home;
