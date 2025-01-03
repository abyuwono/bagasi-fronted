import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

interface ShopperAdCardProps {
  ad: {
    _id: string;
    productImage: string;
    cloudflareImageUrl?: string;
    cloudflareImageId?: string;
    productUrl: string;
    productName?: string;
    merchantName?: string;
    productWeight: number;
    commission: {
      idr: number;
      native: number;
      currency: 'AUD' | 'IDR' | 'USD' | 'SGD' | 'KRW';
    };
    status: string;
  };
}

const ShopperAdCard: React.FC<ShopperAdCardProps> = ({ ad }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'in_discussion':
        return theme.palette.warning.main;
      case 'accepted':
        return theme.palette.info.main;
      case 'shipped':
        return theme.palette.primary.main;
      case 'completed':
        return theme.palette.success.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Tersedia';
      case 'in_discussion':
        return 'Sedang Diskusi';
      case 'accepted':
        return 'Dalam Proses';
      case 'shipped':
        return 'Dikirim';
      case 'completed':
        return 'Selesai';
      default:
        return 'Dibatalkan';
    }
  };

  return (
    <Link
      to={`/shopper-ads/${ad._id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        <CardMedia
          component="img"
          height="160"
          image={ad.cloudflareImageUrl || ad.productImage}
          alt="Product"
          sx={{ objectFit: 'contain', bgcolor: 'white', p: 1 }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('placeholder')) {
              img.src = 'https://placehold.co/400x400?text=Image+Not+Available';
            }
          }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip
              label={getStatusText(ad.status)}
              size="small"
              sx={{
                bgcolor: getStatusColor(ad.status),
                color: 'white',
                height: '20px',
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.75rem',
                  lineHeight: 1.2
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              Berat Total: {ad.productWeight}KG
            </Typography>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 0.5,
              minHeight: '42px',
              lineHeight: 1.3,
              fontSize: '0.875rem'
            }}
          >
            {ad.productName || 'Unnamed Product'}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 1
            }}
          >
            {ad.merchantName ? `${ad.merchantName}` : ''}
          </Typography>

          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Komisi Jastiper
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(ad.commission.idr, 'IDR')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({formatCurrency(ad.commission.native, ad.commission.currency)})
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              color="primary"
              sx={{ 
                mt: 1,
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              Ambil Jastip
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ShopperAdCard;
