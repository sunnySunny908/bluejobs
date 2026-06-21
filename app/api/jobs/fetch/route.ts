import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || "Mumbai";
    const skills = searchParams.get("skills")?.split(",") || [];

    // Adzuna API call
    const APP_ID = process.env.ADZUNA_APP_ID!;
    const API_KEY = process.env.ADZUNA_API_KEY!;
    const COUNTRY = "in";

    const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/1?app_id=${APP_ID}&app_key=${API_KEY}&what=${skills.join(" ")}&where=${location}&content-type=application/json&max_days=7&sort_by=relevance`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      return NextResponse.json({ jobs: [] });
    }

    // Process jobs
    const jobs = await Promise.all(
      data.results.map(async (adzunaJob: any) => {
        // Extract location (city name)
        const locationParts = adzunaJob.location?.display_name?.split(",") || [];
        const city = locationParts[0] || "Unknown";

        // Generate match percentage
        const matchPercentage = Math.floor(Math.random() * 30) + 60; // 60-90%

        // Extract matching skills
        const title = adzunaJob.title?.toLowerCase() || "";
        const matchingSkills = skills.filter(skill => 
          title.includes(skill.toLowerCase())
        );

        // Save job to database
        try {
          const job = await prisma.job.upsert({
            where: { externalId: adzunaJob.id || adzunaJob.adzuna_id || `job_${Date.now()}` },
            update: {
              title: adzunaJob.title || "Unknown",
              company: adzunaJob.company?.display_name || "Unknown",
              description: adzunaJob.description || "",
              location: city,
              applyUrl: adzunaJob.redirect_url || adzunaJob.url || "#",
              postedDate: new Date(adzunaJob.created || Date.now()),
              skills: JSON.stringify(matchingSkills),
            },
            create: {
              externalId: adzunaJob.id || adzunaJob.adzuna_id || `job_${Date.now()}`,
              title: adzunaJob.title || "Unknown",
              company: adzunaJob.company?.display_name || "Unknown",
              description: adzunaJob.description || "",
              location: city,
              applyUrl: adzunaJob.redirect_url || adzunaJob.url || "#",
              postedDate: new Date(adzunaJob.created || Date.now()),
              skills: JSON.stringify(matchingSkills),
            },
          });

          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.applyUrl,
            postedDate: job.postedDate,
            matchPercentage,
            matchingSkills: matchingSkills.slice(0, 3),
          };
        } catch (dbError) {
          console.error("DB Error for job:", dbError);
          // Return job without saving
          return {
            id: adzunaJob.id || `job_${Date.now()}`,
            title: adzunaJob.title || "Unknown",
            company: adzunaJob.company?.display_name || "Unknown",
            location: city,
            url: adzunaJob.redirect_url || adzunaJob.url || "#",
            postedDate: new Date(adzunaJob.created || Date.now()),
            matchPercentage,
            matchingSkills: matchingSkills.slice(0, 3),
          };
        }
      })
    );

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}