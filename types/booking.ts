export type Booking = {
    id: string
    fullName: string
    destination: string
    departureDate: string
    status: 'upcoming' | 'completed' | 'cancelled'
    createdAt: string
  }
  