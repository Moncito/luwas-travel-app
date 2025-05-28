// app/admin/types.ts

export interface Booking {
  id: string;
  userId: string;
  destination: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  // Add any additional fields you use
}
