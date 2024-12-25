import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { formatPrice } from '../utils/format';
import { Ad } from '../types';

interface AdsTableProps {
  ads: Ad[];
  title?: string;
  showPagination?: boolean;
  maxRows?: number;
}

const AdsTable: React.FC<AdsTableProps> = ({ 
  ads, 
  title = "Daftar Jasa Titip Tersedia", 
  showPagination = true,
  maxRows
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRowClick = (id: string) => {
    navigate(`/ads/${id}`);
  };

  const displayedAds = maxRows ? ads.slice(0, maxRows) : ads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </Box>
      )}
      <TableContainer sx={{ maxHeight: maxRows ? 'auto' : 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rute</TableCell>
              <TableCell>Keberangkatan</TableCell>
              <TableCell align="right">Kapasitas</TableCell>
              <TableCell align="right">Harga/kg</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Traveler</TableCell>
              <TableCell align="center">Kontak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedAds.map((ad) => (
              <TableRow
                hover
                key={ad._id}
                sx={{ 
                  cursor: 'pointer',
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
                onClick={() => handleRowClick(ad._id)}
              >
                <TableCell>
                  <Typography variant="body2">
                    {ad.departureCity || '-'} - {ad.arrivalCity || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(ad.departureDate)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {ad.availableWeight || 0} kg
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatPrice(ad.pricePerKg || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ad.status || 'unknown'} 
                    size="small"
                    color={getStatusColor(ad.status || '')}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {ad.customDisplayName || ad.user?.username || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Hubungi via WhatsApp" onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${ad.customWhatsapp || ad.user?.whatsappNumber}`, '_blank');
                  }}>
                    <IconButton size="small" color="success">
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={ads.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman"
        />
      )}
    </Paper>
  );
};

export default AdsTable;
