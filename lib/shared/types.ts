/** API/UI shared types (mirrors the Prisma models — keep in sync). */

export interface RoomDto {
  id: string;
  slug: string;
  title: string;
  category: string;
  blockId: string | null;
  description: string;
  capacity: number;
  size: number;
  pricePerNight: number;
  image: string;
  highlights: string[];
  isActive: boolean;
}

export interface BlockDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  view: string;
  startingPrice: number;
  image: string;
  isActive: boolean;
  roomCount?: number;
}

export interface BookingDto {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}