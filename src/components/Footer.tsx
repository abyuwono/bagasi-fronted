import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Tentang Bagasi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform jasa titip terpercaya yang menghubungkan traveler dengan pembeli untuk belanja dari luar negeri dengan aman dan mudah.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Tautan
            </Typography>
            <Link component={RouterLink} to="/" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Beranda
            </Link>
            <Link component={RouterLink} to="/register" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Daftar Sebagai Traveler
            </Link>
            <Link component={RouterLink} to="/register" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Daftar Sebagai Pembeli
            </Link>
            <Link component={RouterLink} to="/login" color="text.secondary" display="block">
              Masuk
            </Link>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Kontak
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: info@bagasi.id
            </Typography>
            <Typography variant="body2" color="text.secondary">
              WhatsApp: +62 812-345-6789
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} Bagasi. Hak Cipta Dilindungi.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
