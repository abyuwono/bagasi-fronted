import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  travelerId: string;
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

const TravelerShopperAds: React.FC<Props> = ({ travelerId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<ShopperAd[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      if (!travelerId) {
        setError('No traveler ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/shopper-ads/traveler/${travelerId}`);
        setAds(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load shopper ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [travelerId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (ads.length === 0) {
    return <Typography>No shopper ads found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell style={{ maxWidth: '150px', padding: '16px 8px' }}>Nama Produk</TableCell>
            <TableCell style={{ width: '80px', whiteSpace: 'nowrap', padding: '16px 8px' }}>Berat</TableCell>
            <TableCell style={{ width: '100px', whiteSpace: 'nowrap', padding: '16px 8px' }}>Harga</TableCell>
            <TableCell style={{ width: '100px', whiteSpace: 'nowrap', padding: '16px 8px' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Pendapatan
              </Typography>
            </TableCell>
            <TableCell style={{ width: '100px', whiteSpace: 'nowrap', padding: '16px 8px' }}>Shopper</TableCell>
            <TableCell style={{ width: '100px', whiteSpace: 'nowrap', padding: '16px 8px' }}>Status</TableCell>
            <TableCell align="center" style={{ width: '50px', padding: '16px 8px' }}>Detail</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad._id}>
              <TableCell 
                style={{ 
                  maxWidth: '150px', 
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4em',
                  height: '2.8em',
                  padding: '16px 8px'
                }}
              >
                {ad.productName}
              </TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '16px 8px' }}>{ad.productWeight} kg</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '16px 8px' }}>IDR {ad.productPriceIDR.toLocaleString()}</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '16px 8px' }}>
                <Typography color="success.main" fontWeight="bold">
                  IDR {ad.commission.idr.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '16px 8px' }}>{ad.user.username}</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '16px 8px' }}>{getStatusLabel(ad.status)}</TableCell>
              <TableCell align="center" style={{ padding: '16px 8px' }}>
                <IconButton
                  size="small"
                  component={RouterLink}
                  to={`/shopper-ads/${ad._id}`}
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

export default TravelerShopperAds;
