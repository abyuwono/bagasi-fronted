export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'traveler' | 'shopper';
  whatsappNumber?: string;
  customWhatsapp?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isAdmin?: boolean;
  membership: {
    type: 'none' | 'shopper';
    expiresAt?: Date;
  };
}

export interface Route {
  from: string;
  to: string;
}

export type Currency = 'AUD' | 'IDR' | 'USD' | 'SGD' | 'KRW';

export interface Commission {
  idr: number;
  native: number;
  currency: Currency;
}

export interface Ad {
  _id: string;
  user: User;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  expiresAt: string;
  availableWeight: number;
  pricePerKg: number;
  currency: Currency;
  additionalNotes?: string;
  status: 'active' | 'expired' | 'booked';
  customDisplayName?: string;
  customRating?: number;
  customWhatsapp?: string;
  commission: Commission;
  productPrice?: number;
  productPriceIDR?: number;
}

export interface Booking {
  _id: string;
  ad: Ad;
  user: User;
  weight: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  user: User;
  type: 'ad_posting' | 'membership';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId: string;
  membershipDuration?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ShopperAd {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  productUrl: string;
  productImage: string;
  productPrice: number;
  productWeight: number;
  productPriceIDR: number;
  commission: Commission;
  shippingAddress: {
    city: string;
    country: string;
    fullAddress?: string;
  };
  localCourier: string;
  notes: string;
  status: string;
  selectedTraveler?: {
    _id: string;
    username: string;
  };
  trackingNumber?: string;
}
