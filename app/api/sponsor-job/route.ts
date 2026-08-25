import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyName, jobId, amount, durationDays } = await req.json();

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));

    await prisma.job.update({
      where: { id: jobId },
      data: {
        isSponsored: true,
        sponsorFee: amount || 99,
        sponsorExpiry: expiresAt,
        sponsorCompany: companyName,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Job sponsored by ${companyName}`,
    });

  } catch (error) {
    console.error("Sponsor error:", error);
    return NextResponse.json(
      { error: "Failed to sponsor job" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const sponsoredJobs = await prisma.job.findMany({
      where: {
        isSponsored: true,
        sponsorExpiry: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      sponsoredJobs
    });

  } catch (error) {
    console.error("Error fetching sponsored jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsored jobs" },
      { status: 500 }
    );
  }
}