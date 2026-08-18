import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {

  try {

    verifyAdmin(request);

    const body = await request.json();

    const room = await prisma.room.create({

      data: body,

    });

    return NextResponse.json(room, {
      status: 201,
    });

  } catch (error) {

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      }
    );

  }

}