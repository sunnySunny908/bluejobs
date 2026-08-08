import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

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
  
  if (file.name.endsWith('.pdf')) {
    try {
      return buffer.toString('utf-8');
    } catch (e) {
      console.error("PDF error:", e);
      return "";
    }
  }
  
  return "";
}

// ==================== EXTRACT JOB ROLES ====================
function extractJobRolesFromCV(text: string): {
  detectedRoles: string[];
  primaryRole: string;
  industry: string;
  matchedKeywords: string[];
  isTech: boolean;
} {
  const lowerText = text.toLowerCase();
  
  const techKeywordsList = [
    'react', 'angular', 'vue', 'next.js', 'html', 'css', 'javascript', 'typescript',
    'python', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'node.js', 'express',
    'django', 'flask', 'spring', 'spring boot', 'laravel', 'rails', 'asp.net',
    'graphql', 'rest api', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'terraform', 'jenkins', 'git', 'github', 'gitlab', 'linux', 'bash',
    'devops', 'sre', 'cloud', 'serverless', 'lambda', 'api', 'microservices',
    'frontend', 'backend', 'full stack', 'mern', 'mean', 'programmer',
    'developer', 'engineer', 'software', 'coding', 'front-end', 'back-end',
    'ui', 'ux', 'figma', 'photoshop', 'illustrator', 'responsive',
    'react.js', 'html5', 'css3', 'reactjs', 'jsx', 'dom', 'api integration',
    'chrome devtools', 'tailwind', 'bootstrap', 'redux', 'webpack', 'vite',
    'frontend engineer', 'software engineer', 'full stack developer'
  ];
  
  const matchedKeywords: string[] = [];
  for (const keyword of techKeywordsList) {
    if (lowerText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }
  
  const uniqueKeywords = [...new Set(matchedKeywords)];
  
  if (uniqueKeywords.length > 0) {
    let primaryRole = "Software Developer";
    if (lowerText.includes("frontend") || lowerText.includes("front-end") || lowerText.includes("ui")) {
      primaryRole = "Frontend Developer";
    } else if (lowerText.includes("backend") || lowerText.includes("back-end")) {
      primaryRole = "Backend Developer";
    } else if (lowerText.includes("full stack") || lowerText.includes("full-stack") || lowerText.includes("mern")) {
      primaryRole = "Full Stack Developer";
    } else if (lowerText.includes("devops") || lowerText.includes("sre") || lowerText.includes("ci/cd")) {
      primaryRole = "DevOps Engineer";
    } else if (lowerText.includes("cloud") && (lowerText.includes("aws") || lowerText.includes("azure") || lowerText.includes("gcp"))) {
      primaryRole = "Cloud Engineer";
    } else if (lowerText.includes("data engineer") || lowerText.includes("etl") || lowerText.includes("data warehouse")) {
      primaryRole = "Data Engineer";
    } else if (lowerText.includes("machine learning") || lowerText.includes("data science") || lowerText.includes("ml")) {
      primaryRole = "Data Scientist";
    } else if (lowerText.includes("mobile") || lowerText.includes("ios") || lowerText.includes("android")) {
      primaryRole = "Mobile Developer";
    } else if (lowerText.includes("security") || lowerText.includes("cybersecurity")) {
      primaryRole = "Security Engineer";
    } else if (lowerText.includes("qa") || lowerText.includes("testing") || lowerText.includes("selenium")) {
      primaryRole = "QA Engineer";
    }
    
    return {
      detectedRoles: [primaryRole],
      primaryRole: primaryRole,
      industry: 'Technology',
      matchedKeywords: uniqueKeywords.slice(0, 10),
      isTech: true
    };
  }

  return {
    detectedRoles: [],
    primaryRole: '',
    industry: 'Non-Tech',
    matchedKeywords: [],
    isTech: false
  };
}

// ==================== CALCULATE MATCH ====================
function calculateMatchPercentage(jobTitle: string, jobDescription: string, matchedKeywords: string[], primaryRole: string): number {
  const combinedText = (jobTitle + " " + jobDescription).toLowerCase();
  let matchCount = 0;
  
  for (const keyword of matchedKeywords) {
    if (combinedText.includes(keyword)) {
      matchCount++;
    }
  }
  
  const roleWords = primaryRole.toLowerCase().split(' ');
  for (const word of roleWords) {
    if (word.length > 3 && combinedText.includes(word)) {
      matchCount += 2;
    }
  }
  
  let percentage = (matchCount / Math.max((matchedKeywords.length) + 5, 1)) * 100;
  percentage = Math.min(Math.round(percentage * 1.5), 98);
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

// ==================== GET COORDINATES (WITH CACHE) ====================
const coordinateCache: { [key: string]: { lat: number; lon: number } } = {};

async function getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
  if (!city || city === "India" || city === "" || city.length < 2) {
    return null;
  }
  
  // Check cache
  if (coordinateCache[city]) {
    return coordinateCache[city];
  }
  
  try {
    const cleanCity = city.replace(/[^a-zA-Z ]/g, '').trim();
    if (!cleanCity || cleanCity.length < 2) return null;
    
    // Try OpenStreetMap
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanCity)}&format=json&limit=1`;
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
        coordinateCache[city] = coords;
        return coords;
      }
    }
    
    // Fallback: Try with state
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanCity + ", India")}&format=json&limit=1`;
    const fallbackResponse = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'bluejobs/1.0' }
    });
    
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      if (data && data.length > 0) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
        coordinateCache[city] = coords;
        return coords;
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
    console.log("📄 Tech CV Validation with 70km Radius...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    const userLocation = formData.get('location') as string || "";
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    let cvText = await readFileContent(file);
    
    console.log("📄 File size:", cvText.length, "bytes");
    console.log("📍 User Location:", userLocation);
    
    // Fallback: Check filename
    const fileName = file.name.toLowerCase();
    if (fileName.includes('frontend') || fileName.includes('engineer') || fileName.includes('developer') || fileName.includes('react')) {
      cvText += " frontend engineer react javascript html css typescript developer";
    }
    
    const roleExtraction = extractJobRolesFromCV(cvText);
    
    console.log("🎯 Is Tech:", roleExtraction.isTech);
    console.log("🏆 Primary Role:", roleExtraction.primaryRole);
    
    if (!roleExtraction.isTech || roleExtraction.detectedRoles.length === 0) {
      return NextResponse.json({
        success: false,
        isTechCV: false,
        error: 'This platform is for IT/Tech professionals only.',
        message: 'Your CV does not appear to be tech-related. Please upload a CV with tech experience.',
        detectedRoles: [],
        matchedKeywords: [],
        matchedJobs: [],
        totalMatches: 0,
        noJobs: true
      });
    }

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== GET USER COORDINATES ====================
    let userCoords = null;
    if (userLocation && userLocation !== "India" && userLocation !== "") {
      userCoords = await getCoordinates(userLocation);
      console.log("📍 User Coords:", userCoords);
    }
    
    if (!userCoords) {
      console.log("⚠️ Could not get coordinates for location:", userLocation);
    }
    
    // ==================== BUILD SEARCH QUERIES ====================
    let searchTerms: string[] = [];
    
    if (roleExtraction.primaryRole) {
      searchTerms.push(roleExtraction.primaryRole);
    }
    
    if (roleExtraction.detectedRoles && roleExtraction.detectedRoles.length > 0) {
      searchTerms.push(...roleExtraction.detectedRoles.slice(0, 2));
    }
    
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    if (searchTerms.length === 0) {
      searchTerms = ['software developer'];
    }
    
    console.log("🔍 Final Search Terms:", searchTerms.slice(0, 5));
    
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
          const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=20&what=${encodeURIComponent(term)}&where=${encodeURIComponent(location)}&max_days_old=7&content-type=application/json`;
          
          const response = await fetchWithTimeout(url, 15000);
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              for (const job of data.results) {
                let jobCity = "";
                let distance = null;
                let isWithinRadius = true;
                
                // Extract city from job location
                if (job.location && job.location.display_name) {
                  const parts = job.location.display_name.split(',');
                  jobCity = parts[0]?.trim() || "";
                }
                
                // Calculate distance only if we have user coordinates
                if (userCoords && jobCity) {
                  const jobCoords = await getCoordinates(jobCity);
                  if (jobCoords) {
                    distance = calculateDistance(
                      userCoords.lat, userCoords.lon,
                      jobCoords.lat, jobCoords.lon
                    );
                    isWithinRadius = distance <= 70;
                    
                    // Log for debugging
                    if (isWithinRadius) {
                      console.log(`✅ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (WITHIN 70km)`);
                    } else {
                      console.log(`❌ ${job.title} - ${jobCity}: ${distance.toFixed(1)}km (OUTSIDE 70km)`);
                    }
                  }
                }
                
                // Only add if within radius or no coordinates
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
                    matchPercentage: calculateMatchPercentage(
                      job.title || '', 
                      job.description || '', 
                      roleExtraction.matchedKeywords || [],
                      roleExtraction.primaryRole || ''
                    ),
                    matchingSkills: roleExtraction.matchedKeywords.slice(0, 5),
                    primaryRole: roleExtraction.primaryRole,
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
    
    console.log(`✅ ${filteredJobs.length} jobs found within 70km of ${userLocation}`);
    
    return NextResponse.json({
      success: true,
      isTechCV: true,
      primaryRole: roleExtraction.primaryRole,
      industry: roleExtraction.industry,
      detectedRoles: roleExtraction.detectedRoles,
      matchedKeywords: roleExtraction.matchedKeywords,
      matchedJobs: filteredJobs,
      totalMatches: filteredJobs.length,
      source: 'Tech Validation + 70km Radius',
      location: userLocation || "India",
      message: filteredJobs.length > 0 
        ? `✅ ${filteredJobs.length} tech jobs within 70km of ${userLocation || "India"}, posted in last 7 days`
        : `⚠️ No tech jobs found within 70km of ${userLocation || "India"}. Try a different location.`
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}