import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    console.log("Slug:", slug);

    const room = await prisma.room.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch room" },
      { status: 500 }
    );
  }
}