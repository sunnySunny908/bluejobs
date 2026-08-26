import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== READ FILE CONTENT ====================
async function readFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  if (file.name.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }
  
  if (file.name.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value || "";
    } catch (e) {
      console.error("Mammoth error:", e);
      return "";
    }
  }
  
  return "";
}

// ==================== AI-BASED DEEP CV ANALYSIS ====================
async function analyzeCVWithAI(text: string): Promise<{
  primaryRole: string;
  secondaryRoles: string[];
  keySkills: string[];
  experienceYears: number;
  industry: string;
  summary: string;
  searchTerms: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      You are an expert career coach and job matching specialist. Analyze this resume in depth and extract structured information.

      CRITICAL RULES:
      1. Read the ENTIRE resume carefully — professional summary, experience, skills, education.
      2. Identify the PRIMARY JOB ROLE based on experience (not education).
      3. Identify SECONDARY ROLES the person is qualified for.
      4. Extract ALL relevant skills (technical + soft) mentioned in experience.
      5. Calculate TOTAL YEARS of experience from professional experience.
      6. Determine the INDUSTRY based on work experience.
      7. Write a 2-3 line SUMMARY of what this person does.
      8. Generate 5-10 SEARCH TERMS that would find the most relevant jobs.

      Return ONLY valid JSON (no markdown, no explanation):
      {
        "primaryRole": "Most accurate job title based on experience",
        "secondaryRoles": ["role2", "role3"],
        "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "experienceYears": X,
        "industry": "Industry name",
        "summary": "2-3 line summary",
        "searchTerms": ["search term 1", "search term 2", "search term 3", "search term 4", "search term 5"]
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
      primaryRole: parsed.primaryRole || 'Software Developer',
      secondaryRoles: parsed.secondaryRoles || [],
      keySkills: parsed.keySkills || [],
      experienceYears: parsed.experienceYears || 3,
      industry: parsed.industry || 'Technology',
      summary: parsed.summary || 'Professional with relevant experience',
      searchTerms: parsed.searchTerms || ['software developer']
    };
  } catch (error) {
    console.error("❌ AI Analysis Error:", error);
    // Fallback to keyword-based
    return fallbackAnalysis(text);
  }
}

// ==================== FALLBACK ANALYSIS ====================
function fallbackAnalysis(text: string): {
  primaryRole: string;
  secondaryRoles: string[];
  keySkills: string[];
  experienceYears: number;
  industry: string;
  summary: string;
  searchTerms: string[];
} {
  const lowerText = text.toLowerCase();
  let primaryRole = "Software Developer";
  const secondaryRoles: string[] = [];
  const keySkills: string[] = [];
  let experienceYears = 3;
  let industry = "Technology";

  // Detect role from keywords
  if (lowerText.includes("frontend") || lowerText.includes("react") || lowerText.includes("ui/ux")) {
    primaryRole = "Frontend Developer";
  } else if (lowerText.includes("backend") || lowerText.includes("api") || lowerText.includes("node.js")) {
    primaryRole = "Backend Developer";
  } else if (lowerText.includes("full stack") || lowerText.includes("mern") || lowerText.includes("full-stack")) {
    primaryRole = "Full Stack Developer";
  } else if (lowerText.includes("devops") || lowerText.includes("sre") || lowerText.includes("ci/cd")) {
    primaryRole = "DevOps Engineer";
  } else if (lowerText.includes("data") || lowerText.includes("etl") || lowerText.includes("warehouse")) {
    primaryRole = "Data Engineer";
  } else if (lowerText.includes("machine learning") || lowerText.includes("ai") || lowerText.includes("data science")) {
    primaryRole = "Data Scientist";
  } else if (lowerText.includes("ios") || lowerText.includes("android") || lowerText.includes("mobile")) {
    primaryRole = "Mobile Developer";
  } else if (lowerText.includes("security") || lowerText.includes("cybersecurity")) {
    primaryRole = "Security Engineer";
  } else if (lowerText.includes("qa") || lowerText.includes("testing") || lowerText.includes("selenium")) {
    primaryRole = "QA Engineer";
  }

  // Detect secondary roles
  if (primaryRole !== "Frontend Developer" && (lowerText.includes("react") || lowerText.includes("angular") || lowerText.includes("vue"))) {
    secondaryRoles.push("Frontend Developer");
  }
  if (primaryRole !== "Backend Developer" && (lowerText.includes("node.js") || lowerText.includes("django") || lowerText.includes("spring"))) {
    secondaryRoles.push("Backend Developer");
  }
  if (primaryRole !== "DevOps Engineer" && (lowerText.includes("docker") || lowerText.includes("kubernetes") || lowerText.includes("aws"))) {
    secondaryRoles.push("DevOps Engineer");
  }
  if (primaryRole !== "Data Engineer" && (lowerText.includes("sql") || lowerText.includes("spark") || lowerText.includes("hadoop"))) {
    secondaryRoles.push("Data Engineer");
  }

  // Extract skills
  const skillKeywords = ['react', 'angular', 'vue', 'node.js', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql', 'git', 'linux', 'agile', 'scrum', 'tdd', 'ci/cd', 'devops', 'cloud', 'api', 'rest', 'graphql', 'microservices', 'html', 'css', 'tailwind', 'bootstrap', 'redux', 'jest', 'cypress', 'selenium', 'jenkins', 'terraform', 'ansible', 'prometheus', 'grafana', 'kafka', 'redis', 'elasticsearch', 'spark', 'hadoop', 'airflow', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'django', 'flask', 'spring', 'spring boot', 'laravel', 'rails', 'asp.net'];
  
  for (const skill of skillKeywords) {
    if (lowerText.includes(skill)) {
      keySkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  // Extract experience
  const expMatch = text.match(/(\d+)\s*(?:years?|yrs?)/i);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1]);
  }

  // Industry detection
  if (lowerText.includes("payroll") || lowerText.includes("tax") || lowerText.includes("finance")) {
    industry = "Finance/Payroll";
  } else if (lowerText.includes("healthcare") || lowerText.includes("medical") || lowerText.includes("clinical")) {
    industry = "Healthcare";
  } else if (lowerText.includes("education") || lowerText.includes("teaching") || lowerText.includes("training")) {
    industry = "Education";
  } else if (lowerText.includes("sales") || lowerText.includes("business development") || lowerText.includes("crm")) {
    industry = "Sales";
  }

  const searchTerms = [primaryRole, ...secondaryRoles.slice(0, 2), ...keySkills.slice(0, 3)];

  return {
    primaryRole,
    secondaryRoles: secondaryRoles.slice(0, 3),
    keySkills: keySkills.slice(0, 10),
    experienceYears,
    industry,
    summary: `${primaryRole} with ${experienceYears} years of experience in ${industry}`,
    searchTerms: searchTerms.slice(0, 8)
  };
}

// ==================== CALCULATE MATCH PERCENTAGE ====================
function calculateMatchPercentage(jobTitle: string, jobDescription: string, aiAnalysis: any): number {
  const combinedText = (jobTitle + " " + jobDescription).toLowerCase();
  let matchCount = 0;
  const allSkills = [...aiAnalysis.keySkills, ...aiAnalysis.secondaryRoles];
  
  // Match against skills
  for (const skill of allSkills) {
    if (combinedText.includes(skill.toLowerCase())) {
      matchCount += 2;
    }
  }
  
  // Match against primary role
  const roleWords = aiAnalysis.primaryRole.toLowerCase().split(' ');
  for (const word of roleWords) {
    if (word.length > 3 && combinedText.includes(word)) {
      matchCount += 3;
    }
  }
  
  // Match against search terms
  for (const term of aiAnalysis.searchTerms) {
    if (combinedText.includes(term.toLowerCase())) {
      matchCount += 1;
    }
  }
  
  let percentage = (matchCount / Math.max((allSkills.length * 2) + 10, 1)) * 100;
  percentage = Math.min(Math.round(percentage * 1.2), 98);
  return Math.max(percentage, 30);
}

// ==================== DISTANCE CALCULATION ====================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ==================== GET COORDINATES ====================
async function getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
  if (!city || city === "India" || city === "" || city.length < 2) {
    return null;
  }
  
  try {
    const cleanCity = city.replace(/[^a-zA-Z ]/g, '').trim();
    if (!cleanCity || cleanCity.length < 2) return null;
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanCity)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'bluejobs/1.0' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// ==================== POST API ====================
export async function POST(req: NextRequest) {
  try {
    console.log("📄 AI-Based CV Analysis with 70km Radius...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    const userLocation = formData.get('location') as string || "";
    const userLat = formData.get('latitude') as string;
    const userLng = formData.get('longitude') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    let cvText = await readFileContent(file);
    
    console.log("📄 File size:", cvText.length, "bytes");
    console.log("📍 User Location:", userLocation);
    
    // ==================== AI-BASED DEEP ANALYSIS ====================
    const aiAnalysis = await analyzeCVWithAI(cvText);
    
    console.log("🧠 AI Analysis Complete:");
    console.log("🏆 Primary Role:", aiAnalysis.primaryRole);
    console.log("📋 Secondary Roles:", aiAnalysis.secondaryRoles);
    console.log("🎯 Key Skills:", aiAnalysis.keySkills.slice(0, 5));
    console.log("📅 Experience:", aiAnalysis.experienceYears, "years");
    console.log("🏢 Industry:", aiAnalysis.industry);
    console.log("📝 Summary:", aiAnalysis.summary);
    console.log("🔍 Search Terms:", aiAnalysis.searchTerms);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== GET USER COORDINATES ====================
    let userCoords = null;
    if (userLat && userLng) {
      userCoords = {
        lat: parseFloat(userLat),
        lon: parseFloat(userLng)
      };
    } else if (userLocation && userLocation !== "India" && userLocation !== "") {
      userCoords = await getCoordinates(userLocation);
    }
    
    // ==================== BUILD SEARCH QUERIES ====================
    let searchTerms = [...aiAnalysis.searchTerms];
    
    // Add primary role if not already included
    if (!searchTerms.some(t => t.toLowerCase().includes(aiAnalysis.primaryRole.toLowerCase()))) {
      searchTerms.unshift(aiAnalysis.primaryRole);
    }
    
    // Add secondary roles
    for (const role of aiAnalysis.secondaryRoles) {
      if (!searchTerms.some(t => t.toLowerCase().includes(role.toLowerCase()))) {
        searchTerms.push(role);
      }
    }
    
    // Add top skills
    for (const skill of aiAnalysis.keySkills.slice(0, 3)) {
      if (!searchTerms.some(t => t.toLowerCase().includes(skill.toLowerCase()))) {
        searchTerms.push(skill);
      }
    }
    
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    if (searchTerms.length === 0) {
      searchTerms = ['software developer'];
    }
    
    console.log("🔍 Final Search Terms:", searchTerms.slice(0, 10));
    
    // ==================== FETCH JOBS ====================
    let allJobs: any[] = [];
    const location = "India";
    
    const fetchWithTimeout = async (url: string, timeout = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'bluejobs/1.0' }
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    for (const term of searchTerms.slice(0, 3)) {
      for (let page = 1; page <= 2; page++) {
        try {
          const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=15&what=${encodeURIComponent(term)}&where=${encodeURIComponent(location)}&max_days_old=7&content-type=application/json`;
          
          const response = await fetchWithTimeout(url, 15000);
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              for (const job of data.results) {
                let jobCity = "";
                let distance = null;
                let isWithinRadius = true;
                
                if (job.location && job.location.display_name) {
                  const parts = job.location.display_name.split(',');
                  jobCity = parts[0]?.trim() || "";
                }
                
                if (userCoords && jobCity) {
                  const jobCoords = await getCoordinates(jobCity);
                  if (jobCoords) {
                    distance = calculateDistance(
                      userCoords.lat, userCoords.lon,
                      jobCoords.lat, jobCoords.lon
                    );
                    isWithinRadius = distance <= 70;
                    
                    if (isWithinRadius) {
                      console.log(`✅ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (WITHIN 70km)`);
                    } else {
                      console.log(`❌ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (OUTSIDE 70km)`);
                    }
                  }
                }
                
                if (!userCoords || (userCoords && isWithinRadius)) {
                  allJobs.push({
                    id: `${job.id}_${term}_${page}`,
                    title: job.title || "Unknown",
                    company: job.company?.display_name || "Unknown",
                    location: job.location?.display_name || "India",
                    city: jobCity,
                    description: job.description?.substring(0, 500) || "",
                    url: job.redirect_url || "#",
                    postedDate: new Date(job.created || Date.now()),
                    matchPercentage: calculateMatchPercentage(job.title || '', job.description || '', aiAnalysis),
                    matchingSkills: aiAnalysis.keySkills.filter(skill => 
                      (job.title + ' ' + (job.description || '')).toLowerCase().includes(skill.toLowerCase())
                    ).slice(0, 5),
                    primaryRole: aiAnalysis.primaryRole,
                    isTechJob: true,
                    distance: distance,
                    withinRadius: isWithinRadius
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching ${term}:`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // ==================== FILTER & SORT JOBS ====================
    const seenUrls = new Set();
    const filteredJobs = allJobs
      .filter(job => {
        if (seenUrls.has(job.url)) return false;
        seenUrls.add(job.url);
        return true;
      })
      .filter(job => {
        const postedDate = new Date(job.postedDate);
        const now = new Date();
        const diffDays = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 50);
    
    console.log(`✅ ${filteredJobs.length} jobs found within 70km of ${userLocation || "India"}`);
    
    return NextResponse.json({
      success: true,
      isTechCV: true,
      primaryRole: aiAnalysis.primaryRole,
      secondaryRoles: aiAnalysis.secondaryRoles,
      keySkills: aiAnalysis.keySkills,
      experienceYears: aiAnalysis.experienceYears,
      industry: aiAnalysis.industry,
      summary: aiAnalysis.summary,
      searchTermsUsed: searchTerms,
      matchedJobs: filteredJobs,
      totalMatches: filteredJobs.length,
      source: 'AI-Powered Deep CV Analysis (Gemini 2.0 Flash)',
      location: userLocation || "India",
      message: filteredJobs.length > 0 
        ? `✅ ${filteredJobs.length} jobs within 70km, matching your experience (${aiAnalysis.primaryRole})`
        : `⚠️ No jobs found within 70km matching your profile. Try a different location.`
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}