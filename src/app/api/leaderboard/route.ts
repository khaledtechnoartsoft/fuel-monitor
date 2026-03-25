import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topReporters = await prisma.user.findMany({
      orderBy: { trustScore: "desc" },
      take: 10,
      select: {
        id: true,
        trustScore: true,
        _count: { select: { reports: true } }
      }
    });

    return NextResponse.json(topReporters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
