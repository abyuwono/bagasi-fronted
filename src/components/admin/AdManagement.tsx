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
  ButtonGroup,
} from '@mui/material';
import { adminApi } from '../../services/api';

interface CityOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const AUSTRALIAN_CITIES: CityOption[] = [
  { value: 'divider-au', label: '--- Australia ---', disabled: true },
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

const INDONESIAN_CITIES: CityOption[] = [
  { value: 'divider-id', label: '--- Indonesia ---', disabled: true },
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

const ALL_CITIES: CityOption[] = [
  { value: 'divider-au', label: '--- Australia ---', disabled: true },
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
  { value: 'darwin', label: 'Darwin' },
  { value: 'divider-id', label: '--- Indonesia ---', disabled: true },
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
  customDisplayName?: string;
  customRating?: number;
}

interface NewAd {
  departureCity: CityOption | null;
  arrivalCity: CityOption | null;
  departureDate: string;
  expiresAt: string;
  availableWeight: number;
  pricePerKg: number;
  currency: string;
  additionalNotes?: string;
  userId: string;
  customDisplayName?: string;
  customRating?: number;
  customWhatsapp?: string;
}

interface AdNotesDialogProps {
  open: boolean;
  onClose: () => void;
  ad: any;
  onSave: (notes: string) => void;
}

const AdNotesDialog: React.FC<AdNotesDialogProps> = ({ open, onClose, ad, onSave }) => {
  const [notes, setNotes] = useState(ad.additionalNotes || '');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const handleFormat = (format: 'bold' | 'italic') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    let formattedText = selectedText;
    if (format === 'bold') {
      formattedText = `**${selectedText}**`;
      setIsBold(!isBold);
    } else if (format === 'italic') {
      formattedText = `*${selectedText}*`;
      setIsItalic(!isItalic);
    }

    const newText = notes.substring(0, range.startOffset) + 
                   formattedText + 
                   notes.substring(range.endOffset);
    setNotes(newText);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Additional Notes</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => handleFormat('bold')}
              variant={isBold ? "contained" : "outlined"}
            >
              <b>B</b>
            </Button>
            <Button 
              onClick={() => handleFormat('italic')}
              variant={isItalic ? "contained" : "outlined"}
            >
              <i>I</i>
            </Button>
          </ButtonGroup>
        </Box>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter additional notes..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

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
  const [loading, setLoading] = useState(false);
  const { flightDate, lastDropDate } = getDefaultDates();
  const [newAd, setNewAd] = useState<NewAd>({
    departureCity: null,
    arrivalCity: null,
    departureDate: flightDate,
    expiresAt: lastDropDate,
    availableWeight: 0,
    pricePerKg: 0,
    currency: 'IDR',
    additionalNotes: '',
    userId: '',
    customDisplayName: '',
    customRating: undefined,
    customWhatsapp: undefined,
  });
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

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
    if (isAdExpired(ad)) return 'Expired';
    return ad.status === 'active' ? 'Active' : 'Inactive';
  };

  const getStatusColor = (ad: Ad) => {
    if (isAdExpired(ad)) return 'error';
    return ad.status === 'active' ? 'success' : 'default';
  };

  const handleCreateAd = async () => {
    try {
      setLoading(true);
      const adData = {
        ...newAd,
        departureCity: newAd.departureCity?.label || '',
        arrivalCity: newAd.arrivalCity?.label || '',
      };
      await adminApi.createAd(adData);
      setIsNewAdDialogOpen(false);
      fetchAds();
      setNewAd({
        departureCity: null,
        arrivalCity: null,
        departureDate: flightDate,
        expiresAt: lastDropDate,
        availableWeight: 0,
        pricePerKg: 0,
        currency: 'AUD',
        additionalNotes: '',
        userId: '',
        customDisplayName: '',
        customRating: undefined,
        customWhatsapp: undefined,
      });
    } catch (error) {
      console.error('Error creating ad:', error);
      setError('Failed to create ad');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotes = (ad: any) => {
    setSelectedAd(ad);
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = async (notes: string) => {
    try {
      await adminApi.updateAd(selectedAd._id, { additionalNotes: notes });
      fetchAds();
    } catch (error) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
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

            <TextField
              label="Custom Display Name (Optional)"
              value={newAd.customDisplayName || ''}
              onChange={(e) => setNewAd({ ...newAd, customDisplayName: e.target.value })}
              helperText="Leave empty to use user's actual name"
              fullWidth
              margin="normal"
            />

            <TextField
              label="Custom Rating (Optional)"
              type="number"
              inputProps={{ min: 0, max: 5, step: 0.1 }}
              value={newAd.customRating || ''}
              onChange={(e) => setNewAd({ ...newAd, customRating: Number(e.target.value) || undefined })}
              helperText="Leave empty to use user's actual rating"
              fullWidth
              margin="normal"
            />

            <TextField
              label="Custom WhatsApp (Optional)"
              value={newAd.customWhatsapp || ''}
              onChange={(e) => setNewAd({ ...newAd, customWhatsapp: e.target.value || undefined })}
              helperText="Leave empty to use user's actual WhatsApp"
              fullWidth
              margin="normal"
            />

            <Autocomplete
              options={ALL_CITIES}
              value={newAd.departureCity}
              onChange={(_, value) => setNewAd({ ...newAd, departureCity: value })}
              getOptionDisabled={(option) => !!option.disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Departure City"
                  required
                />
              )}
            />

            <Autocomplete
              options={ALL_CITIES}
              value={newAd.arrivalCity}
              onChange={(_, value) => setNewAd({ ...newAd, arrivalCity: value })}
              getOptionDisabled={(option) => !!option.disabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Arrival City"
                  required
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
          <Button onClick={handleCreateAd} variant="contained" disabled={loading}>
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
              <TableCell>Notes</TableCell>
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
                      checked={ad.status === 'active'}
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
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleEditNotes(ad)}
                  >
                    Edit Notes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedAd && (
        <AdNotesDialog
          open={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          ad={selectedAd}
          onSave={handleSaveNotes}
        />
      )}
    </Box>
  );
};

export default AdManagement;
