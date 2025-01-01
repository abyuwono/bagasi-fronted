import { Currency } from '../types';

export const formatPrice = (price: number | undefined, currency?: Currency): string => {
  if (!price) return '';
  
  const value = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return `${currency || 'IDR'} ${value}`;
};

export const formatCurrency = formatPrice;
