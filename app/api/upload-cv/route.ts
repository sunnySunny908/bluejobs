import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { prisma } from '@/lib/prisma';

// ==================== HELPER: ROBUST JSON EXTRACTOR ====================
function extractJsonFromText(text: string): any {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {}
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error("Failed to parse extracted JSON object");
    }
  }

  throw new Error("No valid JSON found in AI response");
}

// ==================== READ FILE CONTENT (BULLETPROOF) ====================
async function readFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase(); // ✅ Case-insensitive check
  
  // 1. Handle .docx
  if (fileName.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer: buffer });
      const text = result.value || "";
      if (text.trim().length > 0) {
        return text;
      }
      throw new Error("Mammoth extracted empty text from DOCX");
    } catch (e) {
      console.error("Mammoth error:", e);
      throw new Error("Failed to parse .docx file. It might be corrupted or password-protected. Please try saving it as a new .docx or .txt file.");
    }
  }
  
  // 2. Handle .txt
  if (fileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  // 3. Explicitly reject PDFs (since we don't have a PDF parser loaded)
  if (fileName.endsWith('.pdf')) {
    throw new Error("PDF files are not supported yet. Please convert to .docx or .txt and try again.");
  }

  // 4. Fallback: Reject unknown formats to prevent binary garbage from reaching the AI
  throw new Error(`Unsupported file format: '${file.name}'. Please upload a valid .docx or .txt file.`);
}

// ==================== DEEP CV ANALYSIS WITH OPENROUTER ====================
async function analyzeCVWithOpenRouter(text: string): Promise<{
  primaryRole: string;
  secondaryRoles: string[];
  keySkills: string[];
  experienceYears: number;
  industry: string;
  summary: string;
  searchTerms: string[];
}> {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OpenRouter API key missing!");
      return fallbackAnalysis(text);
    }

    const prompt = `
      You are an expert career coach. Analyze this resume.
      Return ONLY valid JSON:
      {
        "primaryRole": "Most accurate job title",
        "secondaryRoles": ["role2", "role3"],
        "keySkills": ["skill1", "skill2", "skill3"],
        "experienceYears": X,
        "industry": "Industry name",
        "summary": "2-3 line summary",
        "searchTerms": ["term1", "term2", "term3"]
      }

      Resume text:
      ${text.substring(0, 8000)}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bluejobs.onrender.com",
        "X-Title": "bluejobs"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: "Output ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API Error:", response.status, errorText);
      return fallbackAnalysis(text);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      console.error("❌ OpenRouter unexpected response:", data);
      return fallbackAnalysis(text);
    }

    const text_response = data.choices[0].message.content || "";
    
    let parsed: any;
    try {
      parsed = extractJsonFromText(text_response);
    } catch (parseError) {
      console.error("❌ JSON Parsing Error:", parseError);
      return fallbackAnalysis(text);
    }
    
    return {
      primaryRole: parsed.primaryRole || 'Software Developer',
      secondaryRoles: Array.isArray(parsed.secondaryRoles) ? parsed.secondaryRoles : [],
      keySkills: Array.isArray(parsed.keySkills) ? parsed.keySkills : [],
      experienceYears: parsed.experienceYears || 3,
      industry: parsed.industry || 'Technology',
      summary: parsed.summary || 'Professional with relevant experience',
      searchTerms: Array.isArray(parsed.searchTerms) ? parsed.searchTerms : ['software developer']
    };
  } catch (error) {
    console.error("❌ OpenRouter Analysis Error:", error);
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

  if (lowerText.includes("frontend") || lowerText.includes("react")) {
    primaryRole = "Frontend Developer";
  } else if (lowerText.includes("backend") || lowerText.includes("api")) {
    primaryRole = "Backend Developer";
  } else if (lowerText.includes("full stack")) {
    primaryRole = "Full Stack Developer";
  } else if (lowerText.includes("payroll") || lowerText.includes("tax")) {
    primaryRole = "Payroll Specialist";
  }

  const skillKeywords = ['react', 'node.js', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql', 'git', 'linux', 'agile', 'payroll', 'tax', 'accounting', 'reconciliation', 'compliance'];
  
  for (const skill of skillKeywords) {
    if (lowerText.includes(skill)) {
      keySkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  const expMatch = text.match(/(\d+)\s*(?:years?|yrs?)/i);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1]);
  }

  return {
    primaryRole,
    secondaryRoles: secondaryRoles.slice(0, 3),
    keySkills: keySkills.slice(0, 10),
    experienceYears,
    industry,
    summary: `${primaryRole} with ${experienceYears} years`,
    searchTerms: [primaryRole, ...keySkills.slice(0, 3)]
  };
}

// ==================== CALCULATE MATCH PERCENTAGE ====================
function calculateMatchPercentage(jobTitle: string, jobDescription: string, aiAnalysis: any): number {
  const combinedText = (jobTitle + " " + jobDescription).toLowerCase();
  let matchCount = 0;
  const allSkills = [...aiAnalysis.keySkills, ...aiAnalysis.secondaryRoles];
  
  for (const skill of allSkills) {
    if (combinedText.includes(skill.toLowerCase())) {
      matchCount += 2;
    }
  }
  
  const roleWords = aiAnalysis.primaryRole.toLowerCase().split(' ');
  for (const word of roleWords) {
    if (word.length > 3 && combinedText.includes(word)) {
      matchCount += 3;
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

// ==================== GET COORDINATES (CACHED) ====================
const cityCoordsCache = new Map<string, { lat: number; lon: number }>();

async function getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
  if (!city || city === "India" || city === "" || city.length < 2) {
    return null;
  }
  
  if (cityCoordsCache.has(city)) {
    return cityCoordsCache.get(city)!;
  }
  
  try {
    const cleanCity = city.replace(/[^a-zA-Z ]/g, '').trim();
    if (!cleanCity || cleanCity.length < 2) return null;
    
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanCity + ', India')}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'bluejobs/1.0' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
        cityCoordsCache.set(city, coords);
        return coords;
      }
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// ==================== GET NEARBY CITIES ====================
async function getNearbyCities(lat: number, lon: number, radiusKm: number = 70): Promise<string[]> {
  const majorCities = [
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Noida", lat: 28.5355, lon: 77.3910 },
    { name: "Greater Noida", lat: 28.4744, lon: 77.5040 },
    { name: "Gurgaon", lat: 28.4595, lon: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
  ];
  
  const nearbyCities: string[] = [];
  
  for (const city of majorCities) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance <= radiusKm) {
      nearbyCities.push(city.name);
    }
  }
  
  return nearbyCities;
}

// ==================== POST API ====================
export async function POST(req: NextRequest) {
  try {
    console.log("📄 OpenRouter-Based Deep CV Analysis with 70km Radius...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    const userLocation = formData.get('location') as string || "";
    const userLat = formData.get('latitude') as string;
    const userLng = formData.get('longitude') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ✅ CATCH FILE READ ERRORS EXPLICITLY
    let cvText = "";
    try {
      cvText = await readFileContent(file);
    } catch (readError: any) {
      console.error("❌ File Read Error:", readError.message);
      return NextResponse.json({
        success: false,
        isTechCV: false,
        message: readError.message || "Could not read file content."
      }, { status: 400 });
    }
    
    console.log("📄 Extracted text size:", cvText.length, "bytes");
    console.log("📍 User Coords:", userLat, userLng);

    // ✅ STRICT VALIDATION: Prevent empty/corrupted uploads
    if (!cvText || cvText.trim().length < 50) {
      console.error("❌ Invalid CV content received. Length:", cvText?.length);
      return NextResponse.json({
        success: false,
        isTechCV: false,
        message: "Could not read CV content. The file might be corrupted or empty. Please try a different format or re-save the DOCX."
      }, { status: 400 });
    }
    
    // ==================== OPENROUTER ANALYSIS ====================
    const aiAnalysis = await analyzeCVWithOpenRouter(cvText);
    
    console.log("🧠 OpenRouter Analysis Complete:");
    console.log("🏆 Primary Role:", aiAnalysis.primaryRole);
    console.log("🎯 Key Skills:", aiAnalysis.keySkills.slice(0, 5));

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== GET USER COORDINATES & SEARCH LOCATIONS ====================
    let userCoords = null;
    let searchLocations: string[] = [];
    
    if (userLat && userLng && userLat !== "null" && userLng !== "null") {
      userCoords = {
        lat: parseFloat(userLat),
        lon: parseFloat(userLng)
      };
    } else if (userLocation && userLocation !== "India" && userLocation !== "") {
      console.log("🔄 Frontend coords missing. Geocoding location on backend:", userLocation);
      const backendCoords = await getCoordinates(userLocation);
      if (backendCoords) {
        userCoords = backendCoords;
      }
    }

    if (userCoords) {
      searchLocations = await getNearbyCities(userCoords.lat, userCoords.lon, 70);
      console.log("🏙️ Nearby cities within 70km:", searchLocations);
      if (searchLocations.length === 0) {
        searchLocations = ["India"];
      }
    } else if (userLocation && userLocation !== "India") {
      searchLocations = [userLocation];
    } else {
      searchLocations = ["India"];
    }
    
    // ==================== BUILD SEARCH TERMS ====================
    let searchTerms = [...aiAnalysis.searchTerms];
    if (!searchTerms.some(t => t.toLowerCase().includes(aiAnalysis.primaryRole.toLowerCase()))) {
      searchTerms.unshift(aiAnalysis.primaryRole);
    }
    for (const role of aiAnalysis.secondaryRoles) {
      if (!searchTerms.some(t => t.toLowerCase().includes(role.toLowerCase()))) {
        searchTerms.push(role);
      }
    }
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    console.log("🔍 Final Search Terms:", searchTerms.slice(0, 10));
    
    // ==================== FETCH JOBS ====================
    let allJobs: any[] = [];
    let totalJobsFound = 0;
    
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
    
    for (const location of searchLocations) {
      console.log(`\n🔍 Searching in ${location}...`);
      for (const term of searchTerms.slice(0, 3)) {
        try {
          const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=15&what=${encodeURIComponent(term)}&where=${encodeURIComponent(location)}&max_days_old=7&content-type=application/json`;
          const response = await fetchWithTimeout(url, 15000);
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              console.log(`  ✅ ${data.results.length} jobs found for "${term}" in ${location}`);
              totalJobsFound += data.results.length;
              
              for (const job of data.results) {
                let jobCity = "";
                let distance = null;
                let withinRadius = false;

                if (job.location && job.location.display_name) {
                  const parts = job.location.display_name.split(',');
                  jobCity = parts[0]?.trim() || "";
                }
                
                if (userCoords && !isNaN(userCoords.lat) && !isNaN(userCoords.lon)) {
                  const jobCoords = await getCoordinates(jobCity);
                  if (jobCoords) {
                    distance = calculateDistance(userCoords.lat, userCoords.lon, jobCoords.lat, jobCoords.lon);
                    withinRadius = distance <= 70;
                    if (withinRadius) {
                      console.log(`    ✓ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (WITHIN 70km)`);
                    } else {
                      console.log(`    ✗ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (OUTSIDE 70km)`);
                    }
                  }
                } else {
                  withinRadius = false;
                }

                allJobs.push({
                  id: `${job.id}_${term}_${location}`,
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
                  withinRadius: withinRadius
                });
              }
            } else {
              console.log(`  - No jobs for "${term}" in ${location}`);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`Error fetching ${term} in ${location}:`, errorMessage);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`\n📊 Total raw jobs found: ${totalJobsFound}`);
    
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
      .sort((a, b) => {
        if (a.withinRadius && !b.withinRadius) return -1;
        if (!a.withinRadius && b.withinRadius) return 1;
        return b.matchPercentage - a.matchPercentage;
      })
      .slice(0, 50);
    
    const withinRadiusCount = filteredJobs.filter(j => j.withinRadius).length;
    console.log(`\n✅ ${filteredJobs.length} unique jobs`);
    console.log(`📍 Within 70km: ${withinRadiusCount}`);
    
    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');

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
      withinRadiusCount,
      source: 'OpenRouter AI',
      location: searchLocations.join(', '),
      message: `${filteredJobs.length} jobs found${withinRadiusCount > 0 ? ` (${withinRadiusCount} within 70km)` : ''}`
    }, { headers: responseHeaders });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}