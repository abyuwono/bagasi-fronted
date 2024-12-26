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
  Rating,
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Sort ads by departure date (soonest first)
  const sortedAds = [...ads].sort((a, b) => 
    new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  );

  const displayedAds = maxRows 
    ? sortedAds.slice(0, maxRows) 
    : sortedAds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              {!isMobile && <TableCell>Foto</TableCell>}
              <TableCell>Rute</TableCell>
              <TableCell>Keberangkatan</TableCell>
              {!isMobile && <TableCell>Kedatangan</TableCell>}
              {!isMobile && <TableCell>Berat Tersedia</TableCell>}
              <TableCell align="right">Harga/KG</TableCell>
              <TableCell align="center">Rating</TableCell>
              {!isMobile && <TableCell>Mule</TableCell>}
              <TableCell>Detail</TableCell>
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
                {!isMobile && (
                  <TableCell>
                    <img
                      src={ad.imageUrl || '/placeholder.png'}
                      alt={`${ad.departureCity} to ${ad.arrivalCity}`}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </TableCell>
                )}
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
                {!isMobile && (
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(ad.arrivalDate)}
                    </Typography>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Typography variant="body2">
                      {ad.availableWeight} kg
                    </Typography>
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatPrice(ad.pricePerKg || 0, ad.currency)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Rating 
                    value={ad.customRating || ad.user?.rating || 0} 
                    readOnly 
                    size="small" 
                    precision={0.5}
                  />
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Typography variant="body2">
                      {ad.customDisplayName || ad.user?.username || '-'}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Tooltip title="Lihat Detail" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ads/${ad._id}`);
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
          count={sortedAds.length}
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
