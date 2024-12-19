import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js/mobile';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Masukkan email yang valid')
    .required('Email wajib diisi'),
  password: yup
    .string()
    .min(6, 'Password minimal harus 6 karakter')
    .required('Password wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Password harus sama')
    .required('Konfirmasi password wajib diisi'),
  role: yup
    .string()
    .oneOf(['traveler', 'shopper'], 'Silakan pilih peran yang valid')
    .required('Peran wajib dipilih'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const validateWhatsapp = (value: string) => {
    if (!value) {
      return 'Nomor WhatsApp wajib diisi';
    }

    try {
      // Remove any spaces from the input
      const cleanNumber = value.replace(/\s+/g, '');
      
      // If number doesn't start with +, assume it's Indonesian
      const numberWithCountry = cleanNumber.startsWith('+') ? cleanNumber : `+62${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;
      
      if (!isValidPhoneNumber(numberWithCountry)) {
        return 'Format nomor WhatsApp tidak valid';
      }

      const phoneNumber = parsePhoneNumber(numberWithCountry);
      if (!phoneNumber.isValid() || phoneNumber.getType() !== 'MOBILE') {
        return 'Mohon masukkan nomor handphone yang valid';
      }

      return undefined;
    } catch (error) {
      return 'Format nomor WhatsApp tidak valid';
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      whatsappNumber: '',
      role: '',
    },
    validate: (values) => {
      const errors: any = {};
      
      if (!values.email) {
        errors.email = 'Email wajib diisi';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Format email tidak valid';
      }

      if (!values.password) {
        errors.password = 'Password wajib diisi';
      } else if (values.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }

      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Password harus sama';
      }

      const whatsappError = validateWhatsapp(values.whatsappNumber);
      if (whatsappError) {
        errors.whatsappNumber = whatsappError;
      }

      if (!values.role) {
        errors.role = 'Pilih salah satu role';
      }

      return errors;
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        // Format the phone number before submitting
        const cleanNumber = values.whatsappNumber.replace(/\s+/g, '');
        const numberWithCountry = cleanNumber.startsWith('+') ? cleanNumber : `+62${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;
        const phoneNumber = parsePhoneNumber(numberWithCountry);
        
        await register({
          ...registerData,
          whatsappNumber: phoneNumber.format('E.164') // Format to E.164 standard
        });
        navigate('/');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Gagal mendaftar. Silakan coba lagi.';
        if (errorMessage === 'Email already registered') {
          setError('Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan email ini.');
        } else {
          setError(errorMessage);
        }
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Daftar
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
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Kata Sandi"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
          />
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            margin="normal"
          />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Nomor WhatsApp
            </Typography>
            <PhoneInput
              country={'id'}
              value={formik.values.whatsappNumber}
              onChange={(phone) => formik.setFieldValue('whatsappNumber', '+' + phone)}
              inputProps={{
                name: 'whatsappNumber',
                required: true,
              }}
              containerStyle={{
                width: '100%',
              }}
              inputStyle={{
                width: '100%',
                height: '56px',
              }}
              buttonStyle={{
                backgroundColor: 'transparent',
                borderColor: formik.touched.whatsappNumber && formik.errors.whatsappNumber ? '#d32f2f' : undefined,
              }}
            />
            {formik.touched.whatsappNumber && formik.errors.whatsappNumber && (
              <Typography variant="caption" color="error">
                {formik.errors.whatsappNumber}
              </Typography>
            )}
          </Box>

          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Saya ingin:</FormLabel>
            <RadioGroup
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
            >
              <FormControlLabel
                value="traveler"
                control={<Radio />}
                label="JUAL Jasa Titip Bagasi (Traveler)"
              />
              <FormControlLabel
                value="shopper"
                control={<Radio />}
                label="BELI Jasa Titip Bagasi"
              />
            </RadioGroup>
            {formik.touched.role && formik.errors.role && (
              <Typography color="error" variant="caption">
                {formik.errors.role}
              </Typography>
            )}
          </FormControl>

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={formik.isSubmitting}
            sx={{ mt: 3 }}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Daftar'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Sudah punya akun?{' '}
            <Link component={RouterLink} to="/login">
              Masuk di sini
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
