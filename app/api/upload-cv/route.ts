import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

      CRITICAL RULES:
      1. Extract ONLY skills explicitly mentioned in the resume
      2. Extract EXACT job titles from professional experience section
      3. Industry MUST match the primary work domain (e.g., Payroll → "Finance/Payroll")
      4. DO NOT add extra skills not present in the resume
      5. If resume mentions payroll/tax/finance → industry = "Finance/Payroll"
      6. If resume mentions developer/engineer/code → industry = "Technology/Software"

      Return ONLY valid JSON:
      {
        "skills": ["skill1", "skill2"],
        "jobRoles": ["exact job title 1", "exact job title 2"],
        "experience": "X years",
        "location": "city, country",
        "industry": "Industry name"
      }

      Resume text:
      ${text.substring(0, 10000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
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
    return fallbackExtraction(text);
  }
}

function fallbackExtraction(text: string): {
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
} {
  const lowerText = text.toLowerCase();
  const skills: string[] = [];
  const jobRoles: string[] = [];

  // Payroll/Finance keywords
  const payrollKeywords = ['payroll', 'tax', 'w-2', '1099', 'fica', 'suta', 'suit', 'flsa', 'compliance', 'finance', 'accounting'];
  const techKeywords = ['react', 'node.js', 'python', 'java', 'javascript', 'typescript', 'developer', 'engineer'];
  const hrKeywords = ['hr', 'recruitment', 'onboarding', 'benefits', 'employee'];
  const marketingKeywords = ['marketing', 'seo', 'content', 'social media', 'digital'];

  for (const keyword of payrollKeywords) {
    if (lowerText.includes(keyword)) skills.push(keyword);
  }
  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) skills.push(keyword);
  }
  for (const keyword of hrKeywords) {
    if (lowerText.includes(keyword)) skills.push(keyword);
  }
  for (const keyword of marketingKeywords) {
    if (lowerText.includes(keyword)) skills.push(keyword);
  }

  // Detect job roles
  if (lowerText.includes('payroll') || lowerText.includes('tax') || lowerText.includes('finance')) {
    jobRoles.push('Payroll/Tax Specialist');
    skills.push('Payroll', 'Tax', 'Compliance');
  }
  if (lowerText.includes('developer') || lowerText.includes('engineer')) {
    jobRoles.push('Software Developer');
  }
  if (lowerText.includes('hr') || lowerText.includes('recruitment')) {
    jobRoles.push('HR Professional');
  }
  if (lowerText.includes('marketing') || lowerText.includes('seo')) {
    jobRoles.push('Marketing Specialist');
  }

  return {
    skills: [...new Set(skills)],
    jobRoles: jobRoles.length > 0 ? jobRoles : ['Professional'],
    experience: "3-5 years",
    location: "India",
    industry: lowerText.includes('payroll') ? 'Finance/Payroll' : 
              lowerText.includes('developer') ? 'Technology' : 'general'
  };
}

function calculateMatchPercentage(jobTitle: string, jobDescription: string, cvSkills: string[]): number {
  const combinedText = (jobTitle + " " + jobDescription).toLowerCase();
  let matchCount = 0;
  
  for (const skill of cvSkills) {
    if (combinedText.includes(skill.toLowerCase())) {
      matchCount++;
    }
  }
  
  let percentage = (matchCount / Math.max(cvSkills.length, 1)) * 100;
  percentage = Math.min(Math.round(percentage), 98);
  
  return Math.max(percentage, 30);
}

export async function POST(req: NextRequest) {
  try {
    console.log("📄 Starting CV processing...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let cvText = buffer.toString('utf-8');
    
    console.log("📄 File size:", cvText.length, "bytes");
    
    const extractionResult = await extractSkillsWithAI(cvText);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    const detectedIndustry = extractionResult.industry;
    
    console.log("🎯 Extracted Skills:", extractedSkills);
    console.log("💼 Job Roles:", detectedJobRoles);
    console.log("🏢 Industry:", detectedIndustry);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // Build search queries: Job Roles FIRST, then Skills
    let searchTerms: string[] = [];
    
    // Add job roles as primary search terms
    if (detectedJobRoles.length > 0) {
      searchTerms.push(...detectedJobRoles.map(role => {
        // Simplify role for better search
        const simplified = role.toLowerCase()
          .replace(/specialist|analyst|associate|manager|executive/g, '')
          .trim();
        return simplified || role;
      }));
    }
    
    // Add skills as secondary search terms
    if (extractedSkills.length > 0) {
      searchTerms.push(...extractedSkills.slice(0, 5));
    }
    
    // Fallback
    if (searchTerms.length === 0) {
      searchTerms = ['payroll tax finance'];
    }
    
    // Remove duplicates
    searchTerms = [...new Set(searchTerms)];
    console.log("🔍 Search Terms:", searchTerms);
    
    let allJobs: any[] = [];
    
    for (const term of searchTerms.slice(0, 5)) {
      for (let page = 1; page <= 3; page++) {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=15&what=${encodeURIComponent(term)}&max_days_old=7&content-type=application/json`;
        
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              const pageJobs = data.results.map((job: any) => {
                const matchPercentage = calculateMatchPercentage(
                  job.title || '',
                  job.description || '',
                  extractedSkills
                );
                
                const matchingSkills = extractedSkills.filter(skill => {
                  const combined = (job.title + ' ' + (job.description || '')).toLowerCase();
                  return combined.includes(skill.toLowerCase());
                });
                
                return {
                  id: `${job.id}_${term}_${page}`,
                  title: job.title || "Unknown",
                  company: job.company?.display_name || "Unknown",
                  location: job.location?.display_name || "India",
                  description: job.description?.substring(0, 500) || "",
                  url: job.redirect_url || "#",
                  postedDate: new Date(job.created || Date.now()),
                  matchPercentage: matchPercentage,
                  matchingSkills: matchingSkills.slice(0, 5)
                };
              });
              
              allJobs = [...allJobs, ...pageJobs];
            }
          }
        } catch (err) {
          console.error(`Error:`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Remove duplicates and sort
    const seenUrls = new Set();
    const uniqueJobs = allJobs.filter(job => {
      if (seenUrls.has(job.url)) return false;
      seenUrls.add(job.url);
      return true;
    });
    
    uniqueJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const finalJobs = uniqueJobs.slice(0, 50);
    
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
      jobRoles: detectedJobRoles,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}