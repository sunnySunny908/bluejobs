import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || 'developer';
    const location = searchParams.get('location') || 'india';
    
    // Adzuna API call
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_API_KEY;
    
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${location}/search/1?` +
      `app_id=${appId}&app_key=${appKey}` +
      `&results_per_page=50&what=${encodeURIComponent(keyword)}&content-type=application/json`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    const data = await response.json();
    
    if (!data.results) {
      return NextResponse.json({ error: 'No jobs found', jobs: [] });
    }
    
    // Process and store jobs
    const jobs = [];
    for (const adzunaJob of data.results) {
      // Extract skills from title and description
      const extractedSkills = extractSkillsFromJob(
        adzunaJob.title, 
        adzunaJob.description || ''
      );
      
      // Upsert job to database
      const job = await prisma.job.upsert({
        where: { adzunaId: adzunaJob.id || adzunaJob.redirect_url },
        update: {
          title: adzunaJob.title,
          company: adzunaJob.company?.display_name || 'Unknown',
          salary: adzunaJob.salary_min || adzunaJob.salary_max ? 
            `${adzunaJob.salary_min || ''} - ${adzunaJob.salary_max || ''}` : null,
          salaryMin: adzunaJob.salary_min || null,
          salaryMax: adzunaJob.salary_max || null,
          location: adzunaJob.location?.display_name || adzunaJob.latitude ? 
            `${adzunaJob.latitude},${adzunaJob.longitude}` : null,
          description: adzunaJob.description?.substring(0, 1000) || '',
          skills: JSON.stringify(extractedSkills),
          url: adzunaJob.redirect_url,
          updatedAt: new Date(),
        },
        create: {
          title: adzunaJob.title,
          company: adzunaJob.company?.display_name || 'Unknown',
          salaryMin: adzunaJob.salary_min || null,
          salaryMax: adzunaJob.salary_max || null,
          salary: adzunaJob.salary_min || adzunaJob.salary_max ? 
            `${adzunaJob.salary_min || ''} - ${adzunaJob.salary_max || ''}` : null,
          location: adzunaJob.location?.display_name || null,
          description: adzunaJob.description?.substring(0, 1000) || '',
          skills: JSON.stringify(extractedSkills),
          url: adzunaJob.redirect_url,
          adzunaId: adzunaJob.id || adzunaJob.redirect_url,
        }
      });
      
      jobs.push(job);
    }
    
    return NextResponse.json({
      success: true,
      total: jobs.length,
      jobs: jobs,
      source: 'adzuna'
    });
    
  } catch (error) {
    console.error('Adzuna API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch jobs', 
      jobs: [],
      fallback: true 
    }, { status: 500 });
  }
}

// Skill extraction from job description
function extractSkillsFromJob(title: string, description: string): string[] {
  const skillKeywords = [
    'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript',
    'AML', 'Compliance', 'KYC', 'Risk Management', 'Financial Crime',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Next.js',
    'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot', 'C++', 'C#',
    'Machine Learning', 'AI', 'Data Science', 'Tableau', 'Power BI',
    'Blockchain', 'Solidity', 'Smart Contracts'
  ];
  
  const text = `${title} ${description}`.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of skillKeywords) {
    if (text.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  return [...new Set(foundSkills)]; // Remove duplicates
}