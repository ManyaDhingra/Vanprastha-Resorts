import type { Metadata } from "next";
import { prisma } from "@/lib/server/prisma";
import { RoomsPageClient } from "@/components/rooms/rooms-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms & Villas — Vanprastha Resorts",
  description:
    "Browse handpicked pavilions and villas at Vanprastha Resorts — valley and mountain views, wellness amenities and calm luxury in Uttarakhand.",
};

export default async function RoomsPage() {
  const [rooms, blocks] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { pricePerNight: "asc" },
    }),
    prisma.block.findMany({
      where: { isActive: true },
      orderBy: { startingPrice: "asc" },
      include: { _count: { select: { rooms: true } } },
    }),
  ]);

  return <RoomsPageClient rooms={rooms} blocks={blocks} />;
}
