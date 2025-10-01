export type TravelRecord =
  | {
      id: string
      type: 'trip'
      destination: string
      fullName: string
      email: string
      phone?: string
      departureDate?: string
      location?: string
      travelers?: number
      totalPrice?: number
      status: string
      proofUrl?: string
      weather?: {
        condition?: string
        icon?: string
        temperature?: number
      }
    }
  | {
      id: string
      type: 'itinerary'
      slug?: string
      title?: string
      name: string
      email: string
      date?: string
      people?: number
      totalPrice?: number
      status: string
      proofUrl?: string
      weather?: {
        condition?: string
        icon?: string
        temperature?: number
      }
    }
  | {
      id: string
      type: 'promo'
      promoTitle?: string
      fullName: string
      email: string
      departureDate?: string
      location?: string
      discountPercentage?: number
      finalPrice?: number
      createdAt?: string
      proofUrl?: string
      weather?: {
        condition?: string
        icon?: string
        temperature?: number
      }
    }
