// app/api/jobs/route.ts (with caching)
import { NextResponse } from "next/server";

// Simple in-memory cache (Node.js cache)
const cache = new Map();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "software developer";
  const location = searchParams.get("location") || "india";
  
  // Cache key based on search params
  const cacheKey = `jobs_${title}_${location}`;
  const cachedData = cache.get(cacheKey);
  
  // Return cached data if less than 30 minutes old
  if (cachedData && Date.now() - cachedData.timestamp < 30 * 60 * 1000) {
    console.log("Returning cached jobs for:", title);
    return NextResponse.json(cachedData.data);
  }

  const APP_ID = process.env.ADZUNA_APP_ID!;
  const API_KEY = process.env.ADZUNA_API_KEY!;
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=20&what=${encodeURIComponent(title)}&where=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("Adzuna API error:", data);
      // Fallback: database se jobs dikhana agar API fail ho
      return await getFallbackJobs();
    }

    const jobs = data.results?.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      description: job.description?.substring(0, 500),
      url: job.redirect_url,
      createdAt: new Date(job.created),
    })) || [];

    const responseData = { jobs, total: data.count };
    
    // Store in cache
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Adzuna API Error:", error);
    return await getFallbackJobs();
  }
}

// Fallback function to return database jobs if API fails
async function getFallbackJobs() {
  const { prisma } = await import("@/lib/prisma");
  const dbJobs = await prisma.job.findMany({
    take: 20,
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ jobs: dbJobs, total: dbJobs.length, isFallback: true });
}