/** API/UI shared types (mirrors the Prisma models — keep in sync). */

export interface RoomDto {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  capacity: number;
  size: number;
  pricePerNight: number;
  image: string;
  highlights: string[];
  isActive: boolean;
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