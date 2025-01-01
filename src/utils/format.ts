import { Currency } from '../types';

export const formatPrice = (price: number | undefined, currency: Currency | 'IDR' = 'IDR'): string => {
  if (!price) return '';
  
  const value = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return `${currency} ${value}`;
};

export const formatCurrency = formatPrice;
