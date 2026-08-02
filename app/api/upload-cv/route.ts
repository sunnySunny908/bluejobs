import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// AI-Powered Skill Extraction (No Hardcoding!)
async function extractSkillsWithAI(text: string): Promise<{
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are a professional resume parser. Extract structured information from this resume.

      IMPORTANT: Extract ALL skills mentioned - technical, soft skills, domain-specific, tools, software, certifications.
      
      Return ONLY valid JSON in this exact format (no explanation, no markdown):
      {
        "skills": ["skill1", "skill2", "skill3", "..."],
        "jobRoles": ["role1", "role2"],
        "experience": "X years",
        "location": "city, country",
        "industry": "finance/tech/healthcare/etc"
      }

      Resume text:
      ${text.substring(0, 10000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    // Clean and parse JSON
    const cleanJson = text_response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      skills: parsed.skills || [],
      jobRoles: parsed.jobRoles || [],
      experience: parsed.experience || "0 years",
      location: parsed.location || "India",
      industry: parsed.industry || "general"
    };
  } catch (error) {
    console.error("❌ AI Extraction Error:", error);
    // Fallback: basic keyword extraction
    return fallbackExtraction(text);
  }
}

// Fallback function (if AI fails)
function fallbackExtraction(text: string): {
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
} {
  const skills: string[] = [];
  const jobRoles: string[] = [];
  
  // Common skill keywords (just for fallback)
  const commonSkills = [
    'react', 'node.js', 'python', 'java', 'javascript', 'typescript',
    'payroll', 'tax', 'compliance', 'finance', 'accounting',
    'marketing', 'seo', 'content', 'social media',
    'hr', 'recruitment', 'onboarding', 'benefits',
    'project management', 'agile', 'scrum', 'leadership'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  }
  
  // Detect job roles
  if (lowerText.includes('payroll') || lowerText.includes('tax')) {
    jobRoles.push('Payroll/Tax Specialist');
  }
  if (lowerText.includes('developer') || lowerText.includes('engineer')) {
    jobRoles.push('Software Developer');
  }
  if (lowerText.includes('marketing') || lowerText.includes('seo')) {
    jobRoles.push('Marketing Specialist');
  }
  if (lowerText.includes('hr') || lowerText.includes('recruitment')) {
    jobRoles.push('HR Professional');
  }
  
  return {
    skills: [...new Set(skills)],
    jobRoles: jobRoles,
    experience: "3-5 years",
    location: "India",
    industry: "general"
  };
}

// Calculate match percentage with AI-extracted skills
function calculateMatchPercentage(jobTitle: string, jobDescription: string, cvSkills: string[]): number {
  const lowerTitle = jobTitle.toLowerCase();
  const lowerDesc = jobDescription.toLowerCase();
  const combinedText = lowerTitle + " " + lowerDesc;
  
  let matchCount = 0;
  for (const skill of cvSkills) {
    if (combinedText.includes(skill.toLowerCase())) {
      matchCount++;
    }
  }
  
  let percentage = (matchCount / Math.max(cvSkills.length, 1)) * 100;
  // Boost if title matches job role
  if (cvSkills.some(skill => lowerTitle.includes(skill.toLowerCase()))) {
    percentage += 10;
  }
  
  return Math.min(Math.round(percentage), 98);
}

export async function POST(req: NextRequest) {
  try {
    console.log("📄 Starting CV processing...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let cvText = buffer.toString('utf-8');
    
    console.log("📄 File size:", cvText.length, "bytes");
    
    // 🚀 AI-Powered Skill Extraction
    const extractionResult = await extractSkillsWithAI(cvText);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    const detectedIndustry = extractionResult.industry;
    
    console.log("🎯 AI Extracted Skills:", extractedSkills);
    console.log("💼 Detected Job Roles:", detectedJobRoles);
    console.log("🏢 Industry:", detectedIndustry);

    // If no skills extracted, use fallback
    if (extractedSkills.length === 0) {
      console.warn("⚠️ No skills extracted, using fallback");
      const fallback = fallbackExtraction(cvText);
      extractedSkills.push(...fallback.skills);
    }

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ 
        error: 'Adzuna API keys not configured' 
      }, { status: 500 });
    }
    
    // Build search query from extracted skills + job roles
    const searchTerms = [
      ...extractedSkills.slice(0, 5),
      ...detectedJobRoles.slice(0, 2)
    ].filter(Boolean);
    
    const mainSearchTerm = searchTerms.join(" ").trim() || "jobs";
    console.log("🔍 Search Term:", mainSearchTerm);
    
    let allJobs: any[] = [];
    
    // Multi-skill search
    for (const term of searchTerms.slice(0, 4)) {
      for (let page = 1; page <= 3; page++) {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=15&what=${encodeURIComponent(term)}&max_days_old=7&content-type=application/json`;
        
        try {
          const response = await fetch(url, {
            headers: { 'User-Agent': 'bluejobs/1.0' }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const pageJobs = data.results.map((job: any) => {
                const jobTitle = job.title || "";
                const jobDesc = job.description || "";
                const matchPercentage = calculateMatchPercentage(jobTitle, jobDesc, extractedSkills);
                
                // Extract matching skills from job
                const matchingSkills = extractedSkills.filter(skill => {
                  const lower = (jobTitle + " " + jobDesc).toLowerCase();
                  return lower.includes(skill.toLowerCase());
                });
                
                return {
                  id: `${job.id}_${term}_${page}`,
                  title: job.title || "Unknown",
                  company: job.company?.display_name || "Unknown",
                  location: job.location?.display_name || "India",
                  salaryMin: job.salary_min || null,
                  salaryMax: job.salary_max || null,
                  description: job.description?.substring(0, 500) || "",
                  url: job.redirect_url || "#",
                  postedDate: new Date(job.created || Date.now()),
                  matchPercentage: matchPercentage,
                  matchingSkills: matchingSkills.slice(0, 5),
                  detectedIndustry: detectedIndustry
                };
              });
              
              allJobs = [...allJobs, ...pageJobs];
            }
          }
        } catch (err) {
          console.error(`Error fetching ${term} page ${page}:`, err);
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
    
    // Remove duplicates by URL
    const seenUrls = new Set();
    const uniqueJobs = allJobs.filter(job => {
      if (seenUrls.has(job.url)) return false;
      seenUrls.add(job.url);
      return true;
    });
    
    // Sort by match percentage
    uniqueJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    const finalJobs = uniqueJobs.slice(0, 50);
    
    console.log("📊 Total unique jobs:", finalJobs.length);
    
    if (finalJobs.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No jobs found. Try uploading a different CV.',
        extractedSkills: extractedSkills,
        detectedJobRoles: detectedJobRoles,
        matchedJobs: [],
        totalMatches: 0
      });
    }
    
    // Save to database (async)
    for (const job of finalJobs) {
      try {
        await prisma.job.upsert({
          where: { externalId: job.id },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            applyUrl: job.url,
            skills: JSON.stringify(job.matchingSkills || []),
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
            skills: JSON.stringify(job.matchingSkills || [])
          }
        });
      } catch (err) {
        console.error('Error saving job:', err);
      }
    }
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      detectedJobRoles: detectedJobRoles,
      detectedIndustry: detectedIndustry,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'AI-Powered Skill Extraction'
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}