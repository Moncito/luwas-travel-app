export interface ItineraryBooking {
  id: string;
  name: string;
  email: string;
  date: string;
  people: number;
  slug?: string;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';
  createdAt: string | Date; // accept both Date and ISO string
  totalPrice: number;
  phone?: string;
  proofUrl?: string;
  weather: {
  condition: string,   // "Rain", "Cloudy", "Sunny"
  temperature: number, // in Celsius
  icon: string,        // weather API icon url/code
  fetchedAt: string,   // ISO timestamp when fetched
}
}
