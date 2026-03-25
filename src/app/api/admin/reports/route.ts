import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, trustScore: true } },
      _count: { select: { votes: true, flags: true } }
    }
  });

  return NextResponse.json(reports);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, isVerified } = await req.json();

  const report = await prisma.report.update({
    where: { id },
    data: { isVerified }
  });

  if (isVerified) {
    await prisma.user.update({
      where: { id: report.userId },
      data: { trustScore: { increment: 50 } }
    });
  }

  return NextResponse.json(report);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

  await prisma.report.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
