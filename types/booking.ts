export type Booking = {
  id: string
  fullName: string
  email: string
  phone: string
  destination: string
  departureDate: string
  createdAt: string
  status: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment'
  proofUrl?: string
}
