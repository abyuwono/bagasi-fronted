import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Typography,
} from '@mui/material';
import { adminApi } from '../../services/api';

const AUSTRALIAN_CITIES = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Gold Coast',
  'Canberra',
  'Newcastle',
  'Hobart',
  'Darwin',
];

const INDONESIAN_CITIES = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Denpasar',
];

const CURRENCIES = [
  { code: 'AUD', label: 'Dollar Australia (AUD)' },
  { code: 'IDR', label: 'Rupiah Indonesia (IDR)' },
  { code: 'USD', label: 'Dollar Amerika (USD)' },
  { code: 'SGD', label: 'Dollar Singapura (SGD)' },
  { code: 'KRW', label: 'Won Korea (KRW)' },
];

interface User {
  _id: string;
  name: string;
  email: string;
  whatsapp: string;
}

interface Ad {
  _id: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  expiresAt: string;
  availableWeight: number;
  pricePerKg: number;
  currency: string;
  additionalNotes?: string;
  active: boolean;
  user: User;
  createdAt: string;
  status: string;
}

interface NewAd {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  expiresAt: string;
  availableWeight: number;
  pricePerKg: number;
  currency: string;
  additionalNotes?: string;
  userId: string;
}

const getDefaultDates = () => {
  const today = new Date();
  const flightDate = new Date(today);
  flightDate.setDate(today.getDate() + 21);
  const lastDropDate = new Date(flightDate);
  lastDropDate.setDate(flightDate.getDate() - 3);
  
  return {
    flightDate: flightDate.toISOString().split('T')[0],
    lastDropDate: lastDropDate.toISOString().split('T')[0],
  };
};

const AdManagement: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNewAdDialogOpen, setIsNewAdDialogOpen] = useState(false);
  const { flightDate, lastDropDate } = getDefaultDates();
  const [newAd, setNewAd] = useState<NewAd>({
    departureCity: '',
    arrivalCity: '',
    departureDate: flightDate,
    expiresAt: lastDropDate,
    availableWeight: 0,
    pricePerKg: 0,
    currency: 'IDR',
    additionalNotes: '',
    userId: '',
  });

  useEffect(() => {
    fetchAds();
    fetchUsers();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await adminApi.getAds();
      setAds(response);
    } catch (err) {
      setError('Failed to fetch ads');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleStatusChange = async (adId: string, active: boolean) => {
    try {
      const response = await adminApi.updateAdStatus(adId, active);
      if (response.error) {
        setError(response.error);
        // Refresh ads to get current state
        fetchAds();
        return;
      }
      setAds(ads.map(ad => 
        ad._id === adId ? { ...ad, active: response.active, status: response.status } : ad
      ));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update ad status');
      // Refresh ads to get current state
      fetchAds();
    }
  };

  const isAdExpired = (ad: Ad) => {
    const now = new Date();
    return new Date(ad.expiresAt) <= now;
  };

  const getAdStatus = (ad: Ad) => {
    if (isAdExpired(ad)) {
      return 'Expired';
    }
    return ad.active ? 'Active' : 'Inactive';
  };

  const getStatusColor = (ad: Ad) => {
    if (isAdExpired(ad)) {
      return 'error';
    }
    return ad.active ? 'success' : 'default';
  };

  const handleNewAdSubmit = async () => {
    try {
      await adminApi.createAd(newAd);
      setIsNewAdDialogOpen(false);
      fetchAds();
      setNewAd({
        departureCity: '',
        arrivalCity: '',
        departureDate: flightDate,
        expiresAt: lastDropDate,
        availableWeight: 0,
        pricePerKg: 0,
        currency: 'IDR',
        additionalNotes: '',
        userId: '',
      });
    } catch (err) {
      setError('Failed to create ad');
    }
  };

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        onClick={() => setIsNewAdDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Create New Ad
      </Button>

      <Dialog 
        open={isNewAdDialogOpen} 
        onClose={() => setIsNewAdDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Ad</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              onChange={(_, value) => setNewAd({ ...newAd, userId: value?._id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select User"
                  required
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <Autocomplete
              options={AUSTRALIAN_CITIES}
              value={newAd.departureCity}
              onChange={(_, value) => setNewAd({ ...newAd, departureCity: value || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Departure City"
                  required
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <Autocomplete
              options={INDONESIAN_CITIES}
              value={newAd.arrivalCity}
              onChange={(_, value) => setNewAd({ ...newAd, arrivalCity: value || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Arrival City"
                  required
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <TextField
              label="Flight Date"
              type="date"
              value={newAd.departureDate}
              onChange={(e) => setNewAd({ ...newAd, departureDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Expires At"
              type="date"
              value={newAd.expiresAt}
              onChange={(e) => setNewAd({ ...newAd, expiresAt: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Available Weight (KG)"
              type="number"
              value={newAd.availableWeight}
              onChange={(e) => setNewAd({ ...newAd, availableWeight: Number(e.target.value) })}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 32 }}
            />

            <TextField
              label="Price per KG"
              type="number"
              value={newAd.pricePerKg}
              onChange={(e) => setNewAd({ ...newAd, pricePerKg: Number(e.target.value) })}
              fullWidth
              margin="normal"
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Currency</InputLabel>
              <Select
                value={newAd.currency}
                onChange={(e) => setNewAd({ ...newAd, currency: e.target.value })}
                label="Currency"
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Additional Notes"
              multiline
              rows={4}
              value={newAd.additionalNotes}
              onChange={(e) => setNewAd({ ...newAd, additionalNotes: e.target.value })}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewAdDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewAdSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Flight Date</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Price/KG</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad._id}>
                <TableCell>{ad.departureCity}</TableCell>
                <TableCell>{ad.arrivalCity}</TableCell>
                <TableCell>
                  {ad.departureDate ? new Date(ad.departureDate).toLocaleDateString('id-ID') : '-'}
                </TableCell>
                <TableCell>
                  {ad.expiresAt ? new Date(ad.expiresAt).toLocaleDateString('id-ID') : '-'}
                </TableCell>
                <TableCell>{ad.availableWeight} KG</TableCell>
                <TableCell>{ad.pricePerKg} {ad.currency}</TableCell>
                <TableCell>
                  {ad.user?.email || ad.user?.name || '-'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Switch
                      checked={ad.active}
                      onChange={(e) => handleStatusChange(ad._id, e.target.checked)}
                      color={getStatusColor(ad)}
                      disabled={isAdExpired(ad)}
                    />
                    <Typography 
                      variant="caption" 
                      color={getStatusColor(ad)}
                      sx={{ mt: 0.5 }}
                    >
                      {getAdStatus(ad)}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdManagement;
