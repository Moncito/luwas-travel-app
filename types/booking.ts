export interface Booking {
  id: string;
  userId: string;
  price: number;
  fullName: string; // 🔧 make required
  email: string;    // 🔧 make required
  phone?: string;
  destination: string; // 🔧 make required
  title?: string;
  departureDate: string;
  createdAt: string | Date; // accept both Date and ISO string
  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'pending_payment';
  proofUrl?: string;
  specialRequests?: string;
  location?: string;
  travelers?: number;
  totalPrice: number;
  type: 'trip' | 'itinerary';
  weather: {
  condition: string,   // "Rain", "Cloudy", "Sunny"
  temperature: number, // in Celsius
  icon: string,        // weather API icon url/code
  fetchedAt: string,   // ISO timestamp when fetched
}

}
