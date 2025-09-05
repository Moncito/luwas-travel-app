export interface Promo {
  id: string;
  title: string;                 // e.g. "Summer Getaway"
  description: string;           // details about the promo
  discountPercentage: number;    // % discount (e.g. 20%)
  startDate: string;             // ISO date string
  endDate: string;               // ISO date string
  location: string;              // where the promo applies
  price: number;                 // base price before discount
  finalPrice: number;            // computed after discount
  imageUrl?: string;             // optional cover image
  latitude: number;              // required for weather
  longitude: number;             // required for weather
  createdAt: string | Date;      // track promo creation
  updatedAt?: string | Date;     // optional updates
}
