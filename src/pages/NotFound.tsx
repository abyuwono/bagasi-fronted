import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Halaman Tidak Ditemukan | Bagasi</title>
      </Helmet>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 3,
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
            404
          </Typography>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Halaman Tidak Ditemukan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Kembali ke Beranda
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default NotFound;
