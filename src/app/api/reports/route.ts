import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        votes: true,
      },
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lng, status, description, locationName, userId } = body;

    const report = await prisma.report.create({
      data: {
        lat,
        lng,
        status,
        description,
        locationName,
        userId: userId || "anonymous-user-id", // Placeholder for now
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
