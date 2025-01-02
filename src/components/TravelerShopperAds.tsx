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
  Button,
} from '@mui/material';
import api from '../services/api';
import { ShopperAd } from '../types';

interface Props {
  travelerId: string;
}

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
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (ads.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Belum ada permintaan jastip yang diambil
      </Alert>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nama Produk</TableCell>
            <TableCell>Berat</TableCell>
            <TableCell>Harga</TableCell>
            <TableCell>Pendapatan (Komisi)</TableCell>
            <TableCell>Shopper Username</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>
                <a href={ad.productUrl} target="_blank" rel="noopener noreferrer">
                  {new URL(ad.productUrl).hostname}
                </a>
              </TableCell>
              <TableCell>{ad.productWeight} kg</TableCell>
              <TableCell>IDR {ad.productPriceIDR.toLocaleString()}</TableCell>
              <TableCell>IDR {ad.commission.idr.toLocaleString()}</TableCell>
              <TableCell>{ad.user.username}</TableCell>
              <TableCell>{ad.status}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  component={RouterLink}
                  to={`/shopper-ads/${ad.id}`}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TravelerShopperAds;
