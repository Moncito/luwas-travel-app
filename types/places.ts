// types/places.ts

export interface Place {
  title: string;
  link: string;
  lat: number;
  lon: number;
  type?: string;
  description?: string;
  image?: string;
}
