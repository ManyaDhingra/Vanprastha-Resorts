import { prisma } from "@/lib/server/prisma";
import { RoomsPageClient } from "@/components/rooms/rooms-page";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { pricePerNight: "asc" },
  });

  return <RoomsPageClient rooms={rooms} />;
}