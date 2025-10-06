export interface PromoBooking {
  id: string;
  userId: string;                  // who booked
  fullName: string;                // required
  email: string;                   // required
  price: number;
  phone?: string;
  promoId: string;                  // link back to promo
  promoTitle: string;               // copy of promo title for quick reference
  departureDate: string;            // when they plan to use the promo
  travelers: number;                // number of people
  basePrice: number;                // before discount
  discountPercentage: number;       // % applied
  finalPrice: number;               // after discount
  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';
  createdAt: string | Date;
  proofUrl?: string;
  paymentMethod?: string;
  address?: string;

  weather: {
    condition: string;   // "Sunny", "Rainy"
    temperature: number; // °C
    icon: string;        // weather API icon URL
    fetchedAt: string;   // ISO timestamp
  };
}
