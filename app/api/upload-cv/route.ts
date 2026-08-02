import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== AI CONTEXT EXTRACTION ====================
async function extractContextFromCV(text: string): Promise<{
  primaryRole: string;
  industry: string;
  keySkills: string[];
  experienceSummary: string;
  jobTitles: string[];
  searchTerms: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a professional resume parser. Read this resume COMPLETELY and extract CONTEXTUAL information.

      INSTRUCTIONS:
      1. Read the entire resume carefully — don't just look for keywords.
      2. Understand the PROFESSIONAL EXPERIENCE, not just education or skills.
      3. Determine the PRIMARY JOB ROLE based on experience.
      4. Determine the INDUSTRY based on work experience.
      5. Extract ALL relevant skills mentioned in experience.
      6. Extract ALL job titles mentioned in experience.
      7. Generate 5-10 SEARCH TERMS that would find relevant jobs.

      Return ONLY valid JSON (no markdown, no explanation):
      {
        "primaryRole": "Most accurate job title based on experience",
        "industry": "Industry name from experience",
        "keySkills": ["skill1", "skill2", "skill3"],
        "experienceSummary": "2-3 line summary of what the person does",
        "jobTitles": ["job title 1", "job title 2", "job title 3"],
        "searchTerms": ["search term 1", "search term 2", "search term 3", "search term 4", "search term 5"]
      }

      Resume text:
      ${text.substring(0, 8000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    const cleanJson = text_response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      primaryRole: parsed.primaryRole || 'Professional',
      industry: parsed.industry || 'General',
      keySkills: parsed.keySkills || [],
      experienceSummary: parsed.experienceSummary || '',
      jobTitles: parsed.jobTitles || [],
      searchTerms: parsed.searchTerms || []
    };
  } catch (error) {
    console.error("❌ AI Error:", error);
    // Fallback to keyword-based
    return fallbackContextExtraction(text);
  }
}

// ==================== FALLBACK (If AI Fails) ====================
function fallbackContextExtraction(text: string): {
  primaryRole: string;
  industry: string;
  keySkills: string[];
  experienceSummary: string;
  jobTitles: string[];
  searchTerms: string[];
} {
  const lowerText = text.toLowerCase();
  
  // Industry detection
  const industries = [
    { keywords: ['payroll', 'tax', 'w-2', '1099', 'fica', 'suta', 'finance', 'accounting', 'audit', 'reconciliation'], name: 'Finance/Payroll', role: 'Payroll Specialist', search: ['payroll', 'tax', 'finance', 'accounting'] },
    { keywords: ['react', 'python', 'java', 'javascript', 'aws', 'docker', 'sql', 'devops', 'cloud', 'api', 'microservices'], name: 'Technology', role: 'Software Developer', search: ['developer', 'engineer', 'software', 'programming'] },
    { keywords: ['sales', 'business development', 'lead generation', 'account management', 'negotiation', 'crm'], name: 'Sales', role: 'Sales Manager', search: ['sales', 'business development', 'account manager'] },
    { keywords: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations'], name: 'HR', role: 'HR Manager', search: ['hr', 'human resources', 'recruitment'] },
    { keywords: ['ui', 'ux', 'figma', 'photoshop', 'illustrator', 'graphic design', 'visual design'], name: 'Design', role: 'UI/UX Designer', search: ['design', 'ui/ux', 'graphic', 'creative'] },
    { keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand', 'campaign'], name: 'Marketing', role: 'Marketing Manager', search: ['marketing', 'digital marketing', 'seo', 'content'] },
    { keywords: ['operations', 'supply chain', 'logistics', 'inventory', 'procurement', 'warehouse'], name: 'Operations', role: 'Operations Manager', search: ['operations', 'supply chain', 'logistics', 'procurement'] }
  ];

  let bestIndustry = { name: 'Finance/Payroll', role: 'Payroll Specialist', search: ['payroll', 'tax', 'finance'] };
  let bestScore = 0;

  for (const industry of industries) {
    let score = 0;
    for (const keyword of industry.keywords) {
      if (lowerText.includes(keyword)) {
        score += 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndustry = industry;
    }
  }

  // Extract skills
  const skills: string[] = [];
  const skillKeywords = ['payroll', 'tax', 'finance', 'accounting', 'react', 'python', 'javascript', 'aws', 'docker', 'sql', 'sales', 'crm', 'hr', 'recruitment', 'ui', 'ux', 'design', 'marketing', 'seo', 'operations', 'supply chain', 'logistics'];
  for (const skill of skillKeywords) {
    if (lowerText.includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  return {
    primaryRole: bestIndustry.role,
    industry: bestIndustry.name,
    keySkills: skills.slice(0, 8),
    experienceSummary: `Professional with experience in ${bestIndustry.name}`,
    jobTitles: [bestIndustry.role],
    searchTerms: bestIndustry.search
  };
}

// ==================== CALCULATE MATCH PERCENTAGE ====================
function calculateMatchPercentage(jobTitle: string, jobDescription: string, cvSkills: string[], primaryRole: string): number {
  const combinedText = (jobTitle + " " + jobDescription).toLowerCase();
  let matchCount = 0;
  
  // Match against skills
  for (const skill of cvSkills) {
    if (combinedText.includes(skill.toLowerCase())) {
      matchCount += 2;
    }
  }
  
  // Match against primary role
  const roleWords = primaryRole.toLowerCase().split(' ');
  for (const word of roleWords) {
    if (word.length > 3 && combinedText.includes(word)) {
      matchCount += 3;
    }
  }
  
  let percentage = (matchCount / Math.max((cvSkills.length * 2) + 10, 1)) * 100;
  percentage = Math.min(Math.round(percentage * 1.2), 98);
  return Math.max(percentage, 30);
}

// ==================== POST API ====================
export async function POST(req: NextRequest) {
  try {
    console.log("📄 Starting AI Context Processing...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let cvText = buffer.toString('utf-8');
    
    console.log("📄 File size:", cvText.length, "bytes");
    
    // ==================== AI CONTEXT EXTRACTION ====================
    const context = await extractContextFromCV(cvText);
    
    console.log("🏆 Primary Role:", context.primaryRole);
    console.log("🏢 Industry:", context.industry);
    console.log("📋 Key Skills:", context.keySkills.slice(0, 5));
    console.log("📝 Experience Summary:", context.experienceSummary);
    console.log("💼 Job Titles:", context.jobTitles);
    console.log("🔍 Search Terms:", context.searchTerms);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== BUILD SEARCH QUERIES ====================
    let searchTerms: string[] = [];
    
    // Primary role (most important)
    if (context.primaryRole) {
      searchTerms.push(context.primaryRole);
    }
    
    // Job titles
    if (context.jobTitles && context.jobTitles.length > 0) {
      searchTerms.push(...context.jobTitles.slice(0, 3));
    }
    
    // Search terms from AI
    if (context.searchTerms && context.searchTerms.length > 0) {
      searchTerms.push(...context.searchTerms.slice(0, 5));
    }
    
    // Key skills
    if (context.keySkills && context.keySkills.length > 0) {
      searchTerms.push(...context.keySkills.slice(0, 3));
    }
    
    // Remove duplicates
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    if (searchTerms.length === 0) {
      searchTerms = ['jobs'];
    }
    
    console.log("🔍 Final Search Terms:", searchTerms.slice(0, 10));
    
    // ==================== FETCH JOBS ====================
    let allJobs: any[] = [];
    
    for (const term of searchTerms.slice(0, 6)) {
      for (let page = 1; page <= 3; page++) {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=15&what=${encodeURIComponent(term)}&max_days_old=7&content-type=application/json`;
        
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              const pageJobs = data.results.map((job: any) => ({
                id: `${job.id}_${term}_${page}`,
                title: job.title || "Unknown",
                company: job.company?.display_name || "Unknown",
                location: job.location?.display_name || "India",
                description: job.description?.substring(0, 500) || "",
                url: job.redirect_url || "#",
                postedDate: new Date(job.created || Date.now()),
                matchPercentage: calculateMatchPercentage(
                  job.title || '', 
                  job.description || '', 
                  context.keySkills || [],
                  context.primaryRole || ''
                ),
                matchingSkills: (context.keySkills || []).filter(skill => 
                  (job.title + ' ' + (job.description || '')).toLowerCase().includes(skill.toLowerCase())
                ).slice(0, 5),
                primaryRole: context.primaryRole,
                industry: context.industry
              }));
              
              allJobs = [...allJobs, ...pageJobs];
            }
          }
        } catch (err) {
          console.error(`Error fetching ${term}:`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const seenUrls = new Set();
    const uniqueJobs = allJobs.filter(job => {
      if (seenUrls.has(job.url)) return false;
      seenUrls.add(job.url);
      return true;
    });
    
    uniqueJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const finalJobs = uniqueJobs.slice(0, 50);
    
    console.log("✅ Jobs found:", finalJobs.length);
    console.log("📊 Industry:", context.industry);
    console.log("🏆 Primary Role:", context.primaryRole);
    
    return NextResponse.json({
      success: true,
      primaryRole: context.primaryRole,
      industry: context.industry,
      keySkills: context.keySkills,
      experienceSummary: context.experienceSummary,
      jobTitles: context.jobTitles,
      detectedDomain: context.industry,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'AI Context-Aware Job Matching'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}