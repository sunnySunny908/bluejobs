import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple skill extraction function
function extractSkillsFromText(text: string): string[] {
  const skillsDB = [
    'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript',
    'AML', 'Compliance', 'KYC', 'Risk Management', 'Financial Crime',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Next.js',
    'Angular', 'Vue', 'Django', 'Flask', 'Spring Boot', 'C++', 'C#',
    'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Solidity',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'PHP', 'Laravel', 'Ruby',
    'Swift', 'Kotlin', 'Flutter', 'React Native', 'GraphQL', 'Redis'
  ];
  
  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of skillsDB) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  return [...new Set(foundSkills)];
}

// Calculate match percentage
function calculateMatchPercentage(jobSkills: string[], cvSkills: string[]): number {
  if (jobSkills.length === 0) return 50;
  
  const matchedSkills = cvSkills.filter(cvSkill =>
    jobSkills.some(jobSkill =>
      jobSkill.toLowerCase().includes(cvSkill.toLowerCase()) ||
      cvSkill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  let percentage = (matchedSkills.length / jobSkills.length) * 100;
  percentage = Math.min(Math.round(percentage), 100);
  
  return percentage;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Extract text from file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let cvText = buffer.toString('utf-8');
    
    // Extract skills from CV text
    let extractedSkills = extractSkillsFromText(cvText);
    
    if (extractedSkills.length === 0) {
      extractedSkills = ['JavaScript', 'React', 'Python', 'Node.js', 'Java'];
    }
    
    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ 
        error: 'Adzuna API keys not configured' 
      }, { status: 500 });
    }
    
    let allJobs: any[] = [];
    
    // Fetch jobs for each skill separately to get more results
    const searchTerms = extractedSkills.slice(0, 5); // Use top 5 skills
    
    for (const skill of searchTerms) {
      // 5 pages per skill
      for (let page = 1; page <= 5; page++) {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=10&what=${encodeURIComponent(skill)}&max_days_old=7&content-type=application/json`;
        
        try {
          console.log(`Fetching: ${skill} - Page ${page}`);
          const response = await fetch(url, {
            headers: { 'User-Agent': 'bluejobs/1.0' }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const pageJobs = data.results.map((job: any) => {
                const jobSkills = extractSkillsFromText(job.title + ' ' + (job.description || ''));
                const matchPercentage = calculateMatchPercentage(jobSkills, extractedSkills);
                const matchingSkills = jobSkills.filter(s => 
                  extractedSkills.some(es => 
                    es.toLowerCase().includes(s.toLowerCase()) || 
                    s.toLowerCase().includes(es.toLowerCase())
                  )
                );
                
                return {
                  id: `${job.id}_${skill}_${page}`,
                  title: job.title,
                  company: job.company?.display_name || 'Unknown',
                  location: job.location?.display_name || 'India',
                  salaryMin: job.salary_min || null,
                  salaryMax: job.salary_max || null,
                  description: job.description?.substring(0, 500) || '',
                  url: job.redirect_url || '#',
                  postedDate: new Date(job.created || Date.now()),
                  skills: jobSkills,
                  matchPercentage: matchPercentage,
                  matchingSkills: matchingSkills.slice(0, 5)
                };
              });
              
              allJobs = [...allJobs, ...pageJobs];
            }
          }
        } catch (err) {
          console.error(`Error fetching ${skill} page ${page}:`, err);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Remove duplicates by URL
    const uniqueJobs = [];
    const seenUrls = new Set();
    
    for (const job of allJobs) {
      if (!seenUrls.has(job.url)) {
        seenUrls.add(job.url);
        uniqueJobs.push(job);
      }
    }
    
    // Sort by match percentage
    uniqueJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Take top 50
    const finalJobs = uniqueJobs.slice(0, 50);
    
    if (finalJobs.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No jobs found. Please try different CV.',
        extractedSkills: extractedSkills,
        matchedJobs: [],
        totalMatches: 0
      });
    }
    
    // Save to database
    for (const job of finalJobs) {
      try {
        await prisma.job.upsert({
          where: { externalId: job.id },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            applyUrl: job.url,
            skills: JSON.stringify(job.skills),
            postedDate: job.postedDate
          },
          create: {
            externalId: job.id,
            title: job.title,
            company: job.company,
            description: job.description || "",
            location: job.location,
            applyUrl: job.url,
            postedDate: job.postedDate,
            skills: JSON.stringify(job.skills)
          }
        });
      } catch (err) {
        console.error('Error saving job:', err);
      }
    }
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'Adzuna Real-Time (Multi-Skill Search)'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}