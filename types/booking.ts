// types/Booking.ts

export interface Booking {
  id: string
  userId: string
  fullName?: string
  email?: string
  phone?: string
  destination?: string
  title?: string
  departureDate: string
  createdAt: Date
  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment'
  proofUrl?: string
  specialRequests?: string
  location?: string
  travelers?: number
  price?: number
  type: 'trip' | 'itinerary'
}
