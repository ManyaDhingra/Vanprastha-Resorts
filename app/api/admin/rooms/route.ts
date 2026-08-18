import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    verifyAdmin(request);

    const body = await request.json();

    const {
      slug,
      title,
      category,
      description,
      capacity,
      size,
      pricePerNight,
      image,
    } = body;

    if (
      !slug ||
      !title ||
      !category ||
      !description ||
      !capacity ||
      !size ||
      !pricePerNight ||
      !image
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.room.findUnique({
      where: {
        slug,
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: "Room slug already exists." },
        { status: 409 }
      );
    }

    const room = await prisma.room.create({
      data: {
        slug,
        title,
        category,
        description,
        capacity: Number(capacity),
        size: Number(size),
        pricePerNight: Number(pricePerNight),
        image,
      },
    });

    return NextResponse.json(room, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}