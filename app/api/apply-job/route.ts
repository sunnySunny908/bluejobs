import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Better session check
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    const { jobId, jobData } = await req.json();

    if (!jobId || !jobData) {
      return NextResponse.json({ error: "Missing job data" }, { status: 400 });
    }

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        userId: userId,
        jobId: jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 });
    }

    // Get or create job
    let job = await prisma.job.findFirst({
      where: { externalId: jobId }
    });

    if (!job) {
      job = await prisma.job.create({
        data: {
          externalId: jobId,
          title: jobData.title || "Unknown Position",
          company: jobData.company || "Unknown Company",
          description: "",
          location: jobData.location || "",
          applyUrl: jobData.url || jobData.applyUrl || "#",
          postedDate: new Date(),
          skills: JSON.stringify(jobData.matchingSkills || [])
        }
      });
    }

    // Create application record - FIXED
    await prisma.jobApplication.create({
      data: {
        userId: userId,
        jobId: job.id
      }
    });

    // Increment apply count
    await prisma.user.update({
      where: { id: userId },
      data: { applyCount: { increment: 1 } }
    });

    return NextResponse.json({ 
      success: true, 
      limitReached: true,
      message: "Apply successful" 
    });
    
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "Failed to apply. Please try again." }, { status: 500 });
  }
}