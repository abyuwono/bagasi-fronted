import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import api from '../services/api';
import { ShopperAd } from '../types';

interface Props {
  shopperId: string;
}

const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    draft: 'Draft',
    active: 'Aktif',
    in_discussion: 'Sedang Diskusi',
    accepted: 'Diterima',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };
  return statusMap[status] || status;
};

const ShopperAds: React.FC<Props> = ({ shopperId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<ShopperAd[]>([]);
  const navigate = useNavigate();

  const handleRowClick = (adId: string) => {
    navigate(`/shopper-ads/${adId}`);
  };

  useEffect(() => {
    const fetchAds = async () => {
      if (!shopperId) {
        setError('No shopper ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/shopper-ads/shopper/${shopperId}`);
        setAds(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [shopperId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (ads.length === 0) {
    return <Typography>No ads found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: '160px', padding: '12px 8px' }}>Nama Produk</TableCell>
            <TableCell style={{ width: '50px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Berat</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Harga</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Total</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Traveler</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Status</TableCell>
            <TableCell align="center" style={{ width: '40px', padding: '12px 8px' }}>Detail</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow
              key={ad._id}
              hover
              style={{ cursor: 'pointer' }}
            >
              <TableCell style={{ padding: '12px 8px' }}>
                <Typography noWrap style={{ maxWidth: '160px' }}>
                  {ad.productName}
                </Typography>
              </TableCell>
              <TableCell style={{ padding: '12px 8px' }}>{ad.productWeight} kg</TableCell>
              <TableCell style={{ padding: '12px 8px' }}>
                ${ad.productPrice}
              </TableCell>
              <TableCell style={{ padding: '12px 8px' }}>
                Rp {ad.totalAmount?.toLocaleString() || ad.productPriceIDR?.toLocaleString()}
              </TableCell>
              <TableCell style={{ padding: '12px 8px' }}>
                {ad.selectedTraveler?.username || '-'}
              </TableCell>
              <TableCell style={{ padding: '12px 8px' }}>
                {getStatusLabel(ad.status)}
              </TableCell>
              <TableCell align="center" style={{ padding: '12px 8px' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRowClick(ad._id)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShopperAds;
