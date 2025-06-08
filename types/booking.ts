export interface Booking {
  id: string;
  userId: string;
  fullName: string; // 🔧 make required
  email: string;    // 🔧 make required
  phone?: string;
  destination: string; // 🔧 make required
  title?: string;
  departureDate: string;
  createdAt: string | Date; // accept both Date and ISO string
  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';
  proofUrl?: string;
  specialRequests?: string;
  location?: string;
  travelers?: number;
  totalPrice: number;
  type: 'trip' | 'itinerary';
}
