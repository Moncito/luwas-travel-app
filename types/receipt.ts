export interface BaseBooking {
  id: string;
  amount: number;
  departureDate: string;
}

export interface DestinationBooking extends BaseBooking {
  type: 'destination';
  destinationName: string;
}

export interface ItineraryBooking extends BaseBooking {
  type: 'itinerary';
  itineraryTitle: string;
}

export type Booking = DestinationBooking | ItineraryBooking;

export interface EmailPayload {
  name: string;
  email: string;
  type: 'destination' | 'itinerary';
  booking: Booking;
}
