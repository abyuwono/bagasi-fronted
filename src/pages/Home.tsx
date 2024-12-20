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
import Footer from '../components/Footer';
import { ads } from '../services/api';
import { Ad } from '../types';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adList, setAdList] = useState<Ad[]>([]);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');

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
      ad.departureCity.toLowerCase().includes(fromCity.toLowerCase()) &&
      ad.arrivalCity.toLowerCase().includes(toCity.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Helmet>
        <html lang="id" />
        <title>Bagasi Marketplace - Jasa Titip (JasTip) Terpercaya | Belanja dari Luar Negeri</title>
        <meta name="title" content="Bagasi Marketplace - Platform Jasa Titip (JasTip) Terpercaya | Belanja dari Luar Negeri" />
        <meta name="description" content="Bagasi adalah platform jasa titip (jastip) terpercaya untuk belanja barang dari luar negeri. Temukan jastip terpercaya dengan rating tinggi dan verifikasi resmi. Belanja aman dan mudah dari berbagai negara." />
        <meta name="keywords" content="jastip, jasa titip, titip beli, jastip luar negeri, jastip terpercaya, marketplace jastip, belanja luar negeri, traveler jastip, bagasi" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://market.bagasi.id/" />
        <meta property="og:title" content="Bagasi - Platform Jasa Titip (JasTip) Terpercaya" />
        <meta property="og:description" content="Temukan jastip terpercaya untuk belanja barang dari luar negeri. Belanja aman dan mudah dengan traveler terverifikasi di Bagasi." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://market.bagasi.id/" />
        <meta property="twitter:title" content="Bagasi - Platform Jasa Titip (JasTip) Terpercaya" />
        <meta property="twitter:description" content="Temukan jastip terpercaya untuk belanja barang dari luar negeri. Belanja aman dan mudah dengan traveler terverifikasi di Bagasi." />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="Bagasi" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#34D399" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://api.bagasi.id" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Ke Kota"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
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
      <Footer />
    </Box>
  );
};

export default Home;
