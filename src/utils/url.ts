import { Ad } from '../types';

export const generateAdUrl = (ad: Ad) => {
  const slug = `jastip-${ad.departureCity.toLowerCase()}-${ad.arrivalCity.toLowerCase()}`;
  const date = new Date(ad.departureDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toLowerCase().replace(/ /g, '-');
  return `/ads/${slug}/${date}/${ad._id}`;
};
