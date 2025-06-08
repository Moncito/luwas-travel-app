export interface ItineraryBooking {
  id: string;
  name: string;
  email: string;
  date: string;
  people: number;
  slug?: string;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  totalPrice: number;
}
