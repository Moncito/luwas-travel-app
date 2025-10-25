export interface Booking {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;

  destination: string;
  title?: string; // package title or “Custom Trip to X”
  destinationId?: string;
  tripPackageId?: string; // optional for fixed trips
  tripType: 'fixed' | 'custom'; // NEW FIELD
  type: 'trip' | 'itinerary'; // existing
  activities?: {
    id: string;
    title: string;
    price: number;
    day: number;
  }[];

  departureDate: string;
  returnDate?: string;
  travelers?: number;

  price?: number;
  totalPrice: number;

  location?: string;
  specialRequests?: string;
  proofUrl?: string;

  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'pending_payment';
  createdAt: string | Date;

  weather: {
    condition: string;
    temperature: number;
    icon: string;
    fetchedAt: string;
  };
}
