import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleRowClick = (adId: string) => {
    navigate(`/shopper-ads/${adId}`);
  };

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
            <TableCell style={{ width: '160px', padding: '12px 8px' }}>Nama Produk</TableCell>
            <TableCell style={{ width: '50px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Berat</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Harga</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Pendapatan
              </Typography>
            </TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Shopper</TableCell>
            <TableCell style={{ width: '70px', whiteSpace: 'nowrap', padding: '12px 8px' }}>Status</TableCell>
            <TableCell align="center" style={{ width: '40px', padding: '12px 8px' }}>Detail</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow 
              key={ad._id}
              onClick={() => handleRowClick(ad._id)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <TableCell 
                style={{ 
                  width: '160px',
                  maxWidth: '160px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '12px 8px',
                  borderBottom: 'none'
                }}
                title={ad.productName}
              >
                {ad.productName}
              </TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '12px 8px', borderBottom: 'none' }}>{ad.productWeight} kg</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '12px 8px', borderBottom: 'none' }}>IDR {ad.productPriceIDR.toLocaleString()}</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '12px 8px', borderBottom: 'none' }}>
                <Typography color="success.main" fontWeight="bold">
                  IDR {ad.commission.idr.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '12px 8px', borderBottom: 'none' }}>{ad.user.username}</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', padding: '12px 8px', borderBottom: 'none' }}>{getStatusLabel(ad.status)}</TableCell>
              <TableCell align="center" style={{ padding: '12px 8px', borderBottom: 'none' }}>
                <VisibilityIcon fontSize="small" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TravelerShopperAds;
