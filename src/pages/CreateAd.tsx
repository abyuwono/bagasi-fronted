import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AdPostingConfirmation from '../components/AdPostingConfirmation';

const AUSTRALIAN_CITIES = [
  { value: 'divider-au', label: '--- AUSTRALIA ---', disabled: true },
  { value: 'sydney', label: 'Sydney' },
  { value: 'melbourne', label: 'Melbourne' },
  { value: 'brisbane', label: 'Brisbane' },
  { value: 'perth', label: 'Perth' },
  { value: 'adelaide', label: 'Adelaide' },
  { value: 'goldcoast', label: 'Gold Coast' },
  { value: 'canberra', label: 'Canberra' },
  { value: 'newcastle', label: 'Newcastle' },
  { value: 'wollongong', label: 'Wollongong' },
  { value: 'hobart', label: 'Hobart' },
  { value: 'darwin', label: 'Darwin' }
];

const INDONESIAN_CITIES = [
  { value: 'divider-id', label: '--- INDONESIA ---', disabled: true },
  { value: 'jakarta', label: 'Jakarta' },
  { value: 'surabaya', label: 'Surabaya' },
  { value: 'medan', label: 'Medan' },
  { value: 'bandung', label: 'Bandung' },
  { value: 'semarang', label: 'Semarang' },
  { value: 'makassar', label: 'Makassar' },
  { value: 'palembang', label: 'Palembang' },
  { value: 'tangerang', label: 'Tangerang' },
  { value: 'depok', label: 'Depok' },
  { value: 'yogyakarta', label: 'Yogyakarta' },
  { value: 'denpasar', label: 'Denpasar' }
];

const CURRENCIES = [
  { code: 'AUD', label: 'Dollar Australia (AUD)' },
  { code: 'IDR', label: 'Rupiah Indonesia (IDR)' },
  { code: 'USD', label: 'Dollar Amerika (USD)' },
  { code: 'SGD', label: 'Dollar Singapura (SGD)' },
  { code: 'KRW', label: 'Won Korea (KRW)' },
];

const getDefaultDates = () => {
  const today = new Date();
  
  // Default flight date (3 weeks from today)
  const flightDate = new Date(today);
  flightDate.setDate(today.getDate() + 21);
  
  // Default last drop date (3 days before flight date)
  const lastDropDate = new Date(flightDate);
  lastDropDate.setDate(flightDate.getDate() - 3);
  
  return {
    flightDate: flightDate.toISOString().split('T')[0],
    lastDropDate: lastDropDate.toISOString().split('T')[0],
  };
};

const validationSchema = yup.object({
  departureCity: yup.string().required('Kota asal harus diisi'),
  arrivalCity: yup.string().required('Kota tujuan harus diisi'),
  departureDate: yup.date().required('Tanggal penerbangan harus diisi'),
  returnDate: yup.date()
    .required('Batas pengantaran harus diisi')
    .max(yup.ref('departureDate'), 'Batas pengantaran harus sebelum atau sama dengan tanggal penerbangan'),
  availableWeight: yup.number()
    .required('Berat tersedia harus diisi')
    .positive('Berat harus lebih dari 0')
    .max(32, 'Berat maksimal adalah 32 KG'),
  pricePerKg: yup.number()
    .required('Harga per KG harus diisi')
    .positive('Harga harus lebih dari 0'),
  currency: yup.string().required('Mata uang harus dipilih'),
  additionalNotes: yup.string(),
});

const AD_POSTING_FEE = 195000; // Rp 195.000

const CreateAd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { flightDate, lastDropDate } = getDefaultDates();

  const formik = useFormik({
    initialValues: {
      departureCity: '',
      arrivalCity: '',
      departureDate: flightDate,
      returnDate: lastDropDate,
      availableWeight: '',
      pricePerKg: '',
      currency: 'AUD',
      additionalNotes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setShowConfirmation(true);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = {
        ...formik.values,
        departureCity: formik.values.departureCity,
        arrivalCity: formik.values.arrivalCity
      };

      // Navigate to payment page with ad details
      navigate('/ads/payment', {
        state: {
          adTitle: 'Jastip dari ' + formData.departureCity + ' ke ' + formData.arrivalCity,
          flightDate: formData.departureDate,
          adData: formData
        },
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      setError('Failed to create ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Buka Jasa Titip Baru
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box mb={3}>
          <FormControl fullWidth error={formik.touched.departureCity && Boolean(formik.errors.departureCity)}>
            <InputLabel>Dari</InputLabel>
            <Select
              name="departureCity"
              value={formik.values.departureCity}
              onChange={formik.handleChange}
              label="Dari"
            >
              {AUSTRALIAN_CITIES.map((city) => (
                <MenuItem key={city.value} value={city.value}>
                  {city.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.departureCity && formik.errors.departureCity && (
              <FormHelperText>{formik.errors.departureCity}</FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box mb={3}>
          <FormControl fullWidth error={formik.touched.arrivalCity && Boolean(formik.errors.arrivalCity)}>
            <InputLabel>Ke</InputLabel>
            <Select
              name="arrivalCity"
              value={formik.values.arrivalCity}
              onChange={formik.handleChange}
              label="Ke"
            >
              {INDONESIAN_CITIES.map((city) => (
                <MenuItem key={city.value} value={city.value}>
                  {city.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.arrivalCity && formik.errors.arrivalCity && (
              <FormHelperText>{formik.errors.arrivalCity}</FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            name="departureDate"
            label="Tanggal Penerbangan"
            type="date"
            value={formik.values.departureDate}
            onChange={formik.handleChange}
            error={formik.touched.departureDate && Boolean(formik.errors.departureDate)}
            helperText={formik.touched.departureDate && formik.errors.departureDate}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            name="returnDate"
            label="Batas Pengantaran"
            type="date"
            value={formik.values.returnDate}
            onChange={formik.handleChange}
            error={formik.touched.returnDate && Boolean(formik.errors.returnDate)}
            helperText={formik.touched.returnDate && formik.errors.returnDate}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            name="availableWeight"
            label="Berat Tersedia (KG)"
            type="number"
            value={formik.values.availableWeight}
            onChange={formik.handleChange}
            error={formik.touched.availableWeight && Boolean(formik.errors.availableWeight)}
            helperText={formik.touched.availableWeight && formik.errors.availableWeight}
          />
        </Box>

        <Box mb={3} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            name="pricePerKg"
            label="Harga per KG"
            type="number"
            value={formik.values.pricePerKg}
            onChange={formik.handleChange}
            error={formik.touched.pricePerKg && Boolean(formik.errors.pricePerKg)}
            helperText={formik.touched.pricePerKg && formik.errors.pricePerKg}
          />
          <FormControl sx={{ minWidth: 120 }} error={formik.touched.currency && Boolean(formik.errors.currency)}>
            <InputLabel>Mata Uang</InputLabel>
            <Select
              name="currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
              label="Mata Uang"
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.currency && formik.errors.currency && (
              <FormHelperText>{formik.errors.currency}</FormHelperText>
            )}
          </FormControl>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            name="additionalNotes"
            label="Catatan Tambahan"
            multiline
            rows={4}
            value={formik.values.additionalNotes}
            onChange={formik.handleChange}
            error={formik.touched.additionalNotes && Boolean(formik.errors.additionalNotes)}
            helperText={formik.touched.additionalNotes && formik.errors.additionalNotes}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Biaya Pemasangan Iklan:
          </Typography>
          <Typography variant="h6" color="primary">
            Rp {AD_POSTING_FEE.toLocaleString('id-ID')}
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Bayar & Mulai Jastip'}
        </Button>
      </form>

      <AdPostingConfirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => handleSubmit}
        adData={formik.values}
        postingFee={AD_POSTING_FEE}
      />
    </Paper>
  );
};

export default CreateAd;
