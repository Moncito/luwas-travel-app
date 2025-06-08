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
}
