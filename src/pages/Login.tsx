import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Masukkan email yang valid')
    .required('Email harus diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password harus diisi'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get the redirect path from location state, default to home
  const from = location.state?.from || '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setLoading(true);
        
        // Clear any existing tokens
        localStorage.removeItem('token');
        
        console.log('Attempting login with:', values.email);
        await login(values.email, values.password);
        navigate(from);
      } catch (err: any) {
        console.error('Login error:', err);
        
        if (err.response?.data?.message === 'Account is deactivated' || 
            err.message === 'Account is deactivated') {
          setError('Akun Anda telah dinonaktifkan. Silakan hubungi admin untuk mengaktifkan kembali.');
        } else if (err.response?.status === 401) {
          setError('Email atau password salah. Silakan coba lagi.');
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Terjadi kesalahan saat login. Silakan coba lagi nanti.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
        pt: { xs: '15vh', sm: '20vh' }
      }}
    >
      <Helmet>
        <title>Masuk ke Bagasi - Platform Jasa Titip Terpercaya</title>
        <meta name="title" content="Masuk ke Bagasi - Platform Jasa Titip Terpercaya" />
        <meta name="description" content="Masuk ke akun Bagasi Anda untuk mengakses layanan jasa titip terpercaya. Belanja dari luar negeri dengan mudah dan aman bersama Bagasi." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://market.bagasi.id/login" />
        <meta property="og:title" content="Masuk ke Bagasi - Platform Jasa Titip Terpercaya" />
        <meta property="og:description" content="Masuk ke akun Bagasi Anda untuk mengakses layanan jasa titip terpercaya. Belanja dari luar negeri dengan mudah dan aman bersama Bagasi." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://market.bagasi.id/login" />
        <meta property="twitter:title" content="Masuk ke Bagasi - Platform Jasa Titip Terpercaya" />
        <meta property="twitter:description" content="Masuk ke akun Bagasi Anda untuk mengakses layanan jasa titip terpercaya. Belanja dari luar negeri dengan mudah dan aman bersama Bagasi." />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          mx: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Masuk ke Akun Anda
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
          />

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Masuk'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Belum punya akun?{' '}
              <Link component={RouterLink} to="/register">
                Daftar di sini
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
