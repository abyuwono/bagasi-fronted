export const formatPrice = (price: number, currency: 'AUD' | 'IDR' | 'USD' | 'SGD' | 'KRW' = 'IDR'): string => {
  const currencyLocaleMap = {
    AUD: 'en-AU',
    IDR: 'id-ID',
    USD: 'en-US',
    SGD: 'en-SG',
    KRW: 'ko-KR'
  };

  return new Intl.NumberFormat(currencyLocaleMap[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
