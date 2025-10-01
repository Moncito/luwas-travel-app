// types/travel.ts
export interface TravelRecord {
  id: string
  type: 'trip' | 'itinerary' | 'promo'

  // Common
  fullName: string
  email: string
  userId?: string
  status?: string
  createdAt?: string

  // Trip-specific
  destination?: string
  travelers?: number
  phone?: string
  departureDate?: string
  location?: string

  // Itinerary-specific
  slug?: string
  title?: string
  name?: string
  date?: string
  people?: number

  // Promo-specific
  promoId?: string
  promoTitle?: string
  discountPercentage?: number
  finalPrice?: number

  // Shared pricing
  totalPrice?: number
  specialRequests?: string

  // Proof / payment
  proofUrl?: string
  paidAt?: string
  paidBy?: {
    uid?: string
    email?: string
    name?: string
  }

  // Weather
  weather?: {
    condition?: string
    temperature?: number
    icon?: string
  }
}
