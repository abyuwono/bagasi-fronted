import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Helmet } from 'react-helmet-async';
import AdsTable from '../components/AdsTable';

interface Ad {
  id: string;
  title: string;
  price: number;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  arrivalDate: string;
  weight: number;
  status: string;
  user: {
    name: string;
    phone: string;
  };
}

const HomeAlternative = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + '/ads');
        if (!response.ok) throw new Error('Failed to fetch ads');
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const filteredAds = ads.filter(ad => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ad.originCity.toLowerCase().includes(searchLower) ||
      ad.destinationCity.toLowerCase().includes(searchLower) ||
      ad.user.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Helmet>
        <title>Bagasi - Platform Jasa Titip #1 di Indonesia</title>
        <meta 
          name="description" 
          content="Temukan jasa titip terpercaya di Bagasi. Platform yang menghubungkan traveler dengan pembeli untuk layanan jasa titip yang aman dan terpercaya." 
        />
      </Helmet>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Cari Jasa Titip
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Temukan traveler yang sesuai dengan kebutuhan Anda
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Cari berdasarkan kota asal, tujuan, atau nama traveler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <AdsTable 
              ads={filteredAds} 
              title="Daftar Jasa Titip Tersedia"
              showPagination={true}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default HomeAlternative;