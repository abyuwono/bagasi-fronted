import React, { useState, useEffect } from 'react';
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
import { Helmet } from 'react-helmet-async';

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
  phone: yup
    .string()
    .required('Nomor WhatsApp wajib diisi'),
  role: yup
    .string()
    .oneOf(['traveler', 'shopper'], 'Silakan pilih peran yang valid')
    .required('Peran wajib dipilih'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(60);
  const [canResendEmail, setCanResendEmail] = useState(false);

  const [isWhatsappVerified, setIsWhatsappVerified] = useState(false);
  const [showWhatsappOtpInput, setShowWhatsappOtpInput] = useState(false);
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [isWhatsappVerifying, setIsWhatsappVerifying] = useState(false);
  const [whatsappCountdown, setWhatsappCountdown] = useState(60);
  const [canResendWhatsapp, setCanResendWhatsapp] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showEmailOtpInput && emailCountdown > 0) {
      timer = setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
    } else if (emailCountdown === 0) {
      setCanResendEmail(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showEmailOtpInput, emailCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWhatsappOtpInput && whatsappCountdown > 0) {
      timer = setInterval(() => {
        setWhatsappCountdown((prev) => prev - 1);
      }, 1000);
    } else if (whatsappCountdown === 0) {
      setCanResendWhatsapp(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showWhatsappOtpInput, whatsappCountdown]);

  const handleSendEmailOTP = async (email: string) => {
    try {
      setIsEmailVerifying(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError(data.message);
          return;
        }
        throw new Error('Failed to send OTP');
      }

      setShowEmailOtpInput(true);
      setError(null);
      setEmailCountdown(60);
      setCanResendEmail(false);
    } catch (err) {
      setError('Gagal mengirim OTP. Silakan coba lagi.');
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    try {
      setIsEmailVerifying(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formik.values.email,
          otp: emailOtp 
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      setError(null);
    } catch (err) {
      setError('Kode OTP tidak valid. Silakan coba lagi.');
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleResendEmailOTP = async () => {
    if (!canResendEmail) return;
    setEmailCountdown(60);
    setCanResendEmail(false);
    await handleSendEmailOTP(formik.values.email);
  };

  const handleSendWhatsAppOTP = async (phoneNumber: string) => {
    try {
      setIsWhatsappVerifying(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/otp/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError(data.message);
          return;
        }
        throw new Error('Failed to send WhatsApp OTP');
      }

      setShowWhatsappOtpInput(true);
      setError(null);
      setWhatsappCountdown(60);
      setCanResendWhatsapp(false);
    } catch (err) {
      setError('Gagal mengirim OTP WhatsApp. Silakan coba lagi.');
    } finally {
      setIsWhatsappVerifying(false);
    }
  };

  const handleVerifyWhatsAppOTP = async () => {
    try {
      setIsWhatsappVerifying(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: formik.values.phone,
          otp: whatsappOtp 
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid WhatsApp OTP');
      }

      setIsWhatsappVerified(true);
      setShowWhatsappOtpInput(false);
      setError(null);
    } catch (err) {
      setError('Kode OTP WhatsApp tidak valid. Silakan coba lagi.');
    } finally {
      setIsWhatsappVerifying(false);
    }
  };

  const handleResendWhatsAppOTP = async () => {
    if (!canResendWhatsapp) return;
    setWhatsappCountdown(60);
    setCanResendWhatsapp(false);
    await handleSendWhatsAppOTP(formik.values.phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWhatsapp = (value: string) => {
    if (!value) return 'Nomor WhatsApp wajib diisi';
    try {
      const phoneNumber = parsePhoneNumber(value, 'ID');
      if (!phoneNumber || !isValidPhoneNumber(value, 'ID')) {
        return 'Nomor WhatsApp tidak valid';
      }
      return '';
    } catch (error) {
      return 'Nomor WhatsApp tidak valid';
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: '',
    },
    validate: (values) => {
      const errors: any = {};
      
      if (!values.email) {
        errors.email = 'Email wajib diisi';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Format email tidak valid';
      }

      if (!isEmailVerified) {
        errors.email = 'Email belum diverifikasi';
      }

      if (!isWhatsappVerified) {
        errors.phone = 'Nomor WhatsApp belum diverifikasi';
      }

      if (!values.password) {
        errors.password = 'Password wajib diisi';
      } else if (values.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }

      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Password harus sama';
      }

      const whatsappError = validateWhatsapp(values.phone);
      if (whatsappError) {
        errors.phone = whatsappError;
      }

      if (!values.role) {
        errors.role = 'Pilih salah satu role';
      }

      return errors;
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!isEmailVerified || !isWhatsappVerified) {
        setError('Silakan verifikasi email dan nomor WhatsApp Anda terlebih dahulu');
        return;
      }
      try {
        const { confirmPassword, ...registerData } = values;
        // Format the phone number before submitting
        const cleanNumber = values.phone.replace(/\s+/g, '');
        const numberWithCountry = cleanNumber.startsWith('+') ? cleanNumber : `+62${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;
        const phoneNumber = parsePhoneNumber(numberWithCountry);
        
        await register({
          ...registerData,
          phone: phoneNumber.format('E.164'), // Format to E.164 standard
          whatsappNumber: phoneNumber.format('E.164') // Add whatsappNumber field
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
      <Helmet>
        <title>Daftar di Bagasi - Jadi Traveler atau Pembeli di Platform Jasa Titip</title>
        <meta name="title" content="Daftar di Bagasi - Jadi Traveler atau Pembeli di Platform Jasa Titip" />
        <meta name="description" content="Daftar sekarang di Bagasi untuk menjadi traveler jasa titip atau pembeli. Dapatkan akses ke platform jasa titip terpercaya dengan verifikasi resmi." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://market.bagasi.id/register" />
        <meta property="og:title" content="Daftar di Bagasi - Jadi Traveler atau Pembeli di Platform Jasa Titip" />
        <meta property="og:description" content="Daftar sekarang di Bagasi untuk menjadi traveler jasa titip atau pembeli. Dapatkan akses ke platform jasa titip terpercaya dengan verifikasi resmi." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://market.bagasi.id/register" />
        <meta property="twitter:title" content="Daftar di Bagasi - Jadi Traveler atau Pembeli di Platform Jasa Titip" />
        <meta property="twitter:description" content="Daftar sekarang di Bagasi untuk menjadi traveler jasa titip atau pembeli. Dapatkan akses ke platform jasa titip terpercaya dengan verifikasi resmi." />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
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
            disabled={isEmailVerified}
          />
          {!isEmailVerified && !showEmailOtpInput && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendEmailOTP(formik.values.email)}
              disabled={!formik.values.email || !validateEmail(formik.values.email) || isEmailVerifying}
              sx={{ mt: 1 }}
            >
              {isEmailVerifying ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Mengirim...</span>
                </Box>
              ) : (
                'Kirim Kode OTP'
              )}
            </Button>
          )}
          {showEmailOtpInput && !isEmailVerified && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                id="emailOtp"
                label="Kode OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                helperText="Masukkan kode OTP yang dikirim ke email Anda"
              />
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerifyEmailOTP}
                  disabled={!emailOtp || isEmailVerifying}
                  sx={{ minWidth: 120 }}
                >
                  {isEmailVerifying ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Verifikasi...</span>
                    </Box>
                  ) : (
                    'Verifikasi OTP'
                  )}
                </Button>
                {emailCountdown > 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Kirim ulang dalam {emailCountdown}s
                  </Typography>
                ) : (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleResendEmailOTP}
                    sx={{ textDecoration: 'none' }}
                  >
                    Kirim Ulang OTP
                  </Link>
                )}
              </Box>
            </Box>
          )}
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
              value={formik.values.phone}
              onChange={(phone) => formik.setFieldValue('phone', '+' + phone)}
              inputProps={{
                name: 'phone',
                required: true,
                disabled: isWhatsappVerified,
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
                borderColor: formik.touched.phone && formik.errors.phone ? '#d32f2f' : undefined,
              }}
              disabled={isWhatsappVerified}
            />
            {formik.touched.phone && formik.errors.phone && (
              <Typography variant="caption" color="error">
                {formik.errors.phone}
              </Typography>
            )}
          </Box>

          {!isWhatsappVerified && !showWhatsappOtpInput && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSendWhatsAppOTP(formik.values.phone)}
              disabled={!formik.values.phone || validateWhatsapp(formik.values.phone) !== '' || isWhatsappVerifying}
              sx={{ mt: 1 }}
            >
              {isWhatsappVerifying ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Mengirim...</span>
                </Box>
              ) : (
                'Kirim OTP WhatsApp'
              )}
            </Button>
          )}

          {showWhatsappOtpInput && !isWhatsappVerified && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                id="whatsappOtp"
                label="Kode OTP WhatsApp"
                value={whatsappOtp}
                onChange={(e) => setWhatsappOtp(e.target.value)}
                helperText="Masukkan kode OTP yang dikirim ke WhatsApp Anda"
              />
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerifyWhatsAppOTP}
                  disabled={!whatsappOtp || isWhatsappVerifying}
                  sx={{ minWidth: 120 }}
                >
                  {isWhatsappVerifying ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Verifikasi...</span>
                    </Box>
                  ) : (
                    'Verifikasi OTP'
                  )}
                </Button>
                {whatsappCountdown > 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Kirim ulang dalam {whatsappCountdown}s
                  </Typography>
                ) : (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleResendWhatsAppOTP}
                    sx={{ textDecoration: 'none' }}
                  >
                    Kirim Ulang OTP WhatsApp
                  </Link>
                )}
              </Box>
            </Box>
          )}
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
