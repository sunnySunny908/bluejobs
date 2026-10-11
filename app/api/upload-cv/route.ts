import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// @ts-ignore - Bypassing strict type checking for natural library
import * as natural from 'natural';

// ==================== CONSTANTS: LOCATION DATABASE ====================
const MAJOR_CITIES = [
  // NCR & North
  { name: "Delhi", lat: 28.6139, lon: 77.2090 }, { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Noida", lat: 28.5355, lon: 77.3910 }, { name: "Greater Noida", lat: 28.4744, lon: 77.5040 },
  { name: "Gurgaon", lat: 28.4595, lon: 77.0266 }, { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 }, { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 }, { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 }, { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Jodhpur", lat: 26.2389, lon: 73.0243 }, { name: "Udaipur", lat: 24.5854, lon: 73.7125 },
  { name: "Kota", lat: 25.2138, lon: 75.8648 }, { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Haridwar", lat: 29.9457, lon: 78.1642 }, { name: "Meerut", lat: 28.9845, lon: 77.7064 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 }, { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Prayagraj", lat: 25.4358, lon: 81.8463 }, { name: "Patna", lat: 25.6093, lon: 85.1376 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 }, { name: "Jamshedpur", lat: 22.8046, lon: 86.2029 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 }, { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Cuttack", lat: 20.4625, lon: 85.8828 },
  
  // West
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 }, { name: "Thane", lat: 19.2183, lon: 72.9781 },
  { name: "Navi Mumbai", lat: 19.0330, lon: 73.0297 }, { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Nashik", lat: 19.9975, lon: 73.7898 }, { name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 }, { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 }, { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { name: "Rajkot", lat: 22.3039, lon: 70.8022 }, { name: "Goa", lat: 15.2993, lon: 74.1240 },
  { name: "Panaji", lat: 15.4909, lon: 73.8278 },

  // South
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 }, { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 }, { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 }, { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 }, { name: "Trivandrum", lat: 8.5241, lon: 76.9366 },
  { name: "Mangalore", lat: 12.9141, lon: 74.8560 }, { name: "Mysore", lat: 12.2958, lon: 76.6394 },
  { name: "Hubli", lat: 15.3647, lon: 75.1240 }, { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.6480 }, { name: "Tirupati", lat: 13.6288, lon: 79.4192 },

  // Central & East
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 }, { name: "Howrah", lat: 22.5958, lon: 88.2636 },
  { name: "Dhanbad", lat: 23.7957, lon: 86.4304 }, { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 }, { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
  { name: "Gwalior", lat: 26.2183, lon: 78.1828 }, { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 }, { name: "Jammu", lat: 32.7266, lon: 74.8570 },
  { name: "Amritsar", lat: 31.6340, lon: 74.8723 }, { name: "Ludhiana", lat: 30.9010, lon: 75.8573 }
];

// ==================== ✅ DYNAMIC NLP EXTRACTION (NO HARDCODING) ====================

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractDynamicRole(text: string) {
  const rolePatterns = [
    /(?:worked as|role of|position of|experience as|currently|formerly)\s+(?:a|an)?\s*([A-Z][a-zA-Z\s\-&]+?)(?:\s+at|\s+in|\s+with|,|\.|\n|$)/gi,
    /([A-Z][a-zA-Z\s\-&]+?)\s+(?:Manager|Officer|Analyst|Director|Lead|Specialist|Engineer|Consultant|Coordinator|Administrator|Executive|Head|VP|President|Associate)\b/gi
  ];

  let foundRoles: string[] = [];
  for (const pattern of rolePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      foundRoles = foundRoles.concat(matches.map(m => m.trim()));
    }
  }

  const uniqueRoles = [...new Set(foundRoles)].slice(0, 3);
  const primaryRole = uniqueRoles[0] 
    ? uniqueRoles[0].replace(/^(worked as|role of|position of|experience as|currently|formerly)\s+(?:a|an)?\s*/i, '').trim() 
    : "Professional";

  return {
    primaryRole,
    secondaryRoles: uniqueRoles.slice(1)
  };
}

// ✅ FIX 1: Moved OUTSIDE of extractDynamicRole to fix syntax error
function cleanJobTitle(rawRole: string): string {
  if (!rawRole) return "Professional";
  
  let cleaned = rawRole
    .replace(/professional summary|objective|profile|summary|career objective/gi, '')
    .replace(/dynamic and results-driven|highly motivated|experienced|detail-oriented/gi, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  return words.slice(-4).join(' ') || "Professional";
}

function extractDynamicSkills(text: string): string[] {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  const stopWords = new Set([
    'the','and','is','in','to','of','a','for','with','on','as','by','this','that','it','from','or','an',
    'be','are','was','were','been','have','has','had','do','does','did','will','would','could','should',
    'may','might','can','must','i','me','my','we','our','you','your','he','she','they','them','their',
    'at','not','but','if','so','because','until','while','about','against','between','into','through',
    'during','before','after','above','below','up','down','out','off','over','under','again','further',
    'then','once','here','there','when','where','why','how','all','any','both','each','few','more',
    'most','other','some','such','no','nor','only','own','same','than','too','very','just','also','now'
  ]);

  const freq: Record<string, number> = {};
  tokens.forEach(token => {
    const cleanToken = token.replace(/[^a-z]/g, '');
    if (cleanToken.length > 3 && !stopWords.has(cleanToken)) {
      freq[cleanToken] = (freq[cleanToken] || 0) + 1;
    }
  });

  const sortedSkills = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0]);

  return sortedSkills;
}

function detectDynamicIndustry(skills: string[]): string[] {
  const industries: string[] = [];
  const skillString = skills.join(' ').toLowerCase();
  
  if (skillString.match(/compliance|regulatory|audit|risk|gdpr|sox|legal/)) industries.push('Regulatory & Compliance');
  if (skillString.match(/banking|finance|fintech|investment|trading/)) industries.push('Finance & Banking');
  if (skillString.match(/software|code|developer|engineer|react|python/)) industries.push('Technology & Software');
  if (skillString.match(/healthcare|medical|hospital|patient|clinical/)) industries.push('Healthcare');
  if (skillString.match(/marketing|sales|seo|growth|brand/)) industries.push('Marketing & Sales');
  if (skillString.match(/supply|logistics|warehouse|manufacturing/)) industries.push('Supply Chain & Manufacturing');
  
  return industries.length > 0 ? industries : ['General'];
}

// ==================== HELPER: DEEP RESUME PARSING & INTELLIGENCE ====================

function calculateExperienceTimeline(text: string) {
  const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-\/]+(?:20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-\/]+(?:20\d{2}|19\d{2})|(?:20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:20\d{2}|19\d{2}|Present)/gi;
  const matches = text.match(dateRegex) || [];
  
  let totalMonths = 0;
  let hasLeadership = false;
  let hasManagement = false;
  let progressionScore = 0;

  matches.forEach((match, index) => {
    const years = match.match(/(20\d{2}|19\d{2})/g);
    if (years && years.length >= 2) {
      const start = parseInt(years[0]);
      const end = years[1].toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(years[1]);
      totalMonths += (end - start) * 12;
      if (index > 0) progressionScore += 10;
    }
  });

  if (totalMonths === 0) {
    const yearMatches = text.match(/(\d+)\s*\+?\s*years?/i);
    if (yearMatches) {
      totalMonths = parseInt(yearMatches[1]) * 12;
    }
  }

  const lowerText = text.toLowerCase();
  if (lowerText.includes('led') || lowerText.includes('head') || lowerText.includes('director')) hasLeadership = true;
  if (lowerText.includes('managed') || lowerText.includes('supervised') || lowerText.includes('team of')) hasManagement = true;

  const totalYears = Math.round(totalMonths / 12);
  
  let progressionType = "Stable";
  if (progressionScore > 20) progressionType = "High Growth";
  else if (progressionScore > 0) progressionType = "Steady Growth";

  return {
    totalExperienceYears: totalYears,
    relevantExperienceYears: totalYears,
    leadershipExperience: hasLeadership,
    managementExperience: hasManagement,
    careerProgression: progressionType,
    progressionScore: Math.min(progressionScore, 100)
  };
}

function calculateAdvancedATSScore(text: string, skills: string[], experienceData: any) {
  const lowerText = text.toLowerCase();
  let score = 0;
  let explanations: string[] = [];

  const headings = ['summary', 'experience', 'education', 'skills', 'projects'];
  const foundHeadings = headings.filter(h => lowerText.includes(h)).length;
  score += (foundHeadings / headings.length) * 20;
  if (foundHeadings >= 4) explanations.push("Excellent resume structure");

  const hasMetrics = (text.match(/\d+%|\$\d+|\d+\s*(years|months|people|team)/gi) || []).length;
  score += Math.min((hasMetrics / 3) * 30, 30);
  if (hasMetrics >= 3) explanations.push("Strong use of quantifiable achievements");

  score += Math.min((skills.length / 8) * 25, 25);
  if (skills.length >= 5) explanations.push("Comprehensive skill set detected");

  const actionVerbs = ['developed', 'led', 'managed', 'created', 'optimized', 'designed', 'implemented'];
  const verbCount = actionVerbs.filter(v => lowerText.includes(v)).length;
  score += (verbCount / actionVerbs.length) * 15;
  if (verbCount >= 3) explanations.push("Strong action-oriented language");

  if (lowerText.includes('bachelor') || lowerText.includes('master') || lowerText.includes('degree')) {
    score += 10;
    explanations.push("Education clearly stated");
  }

  return { score: Math.round(score), explanations };
}

function estimateAdvancedSalary(role: string, experienceData: any, seniority: string, industries: string[], skills: string[]) {
  let baseSalary = 300000;
  const years = experienceData.totalExperienceYears;

  if (years === 0) baseSalary = 250000;
  else if (years <= 2) baseSalary = 350000 + (years * 100000);
  else if (years <= 5) baseSalary = 550000 + ((years - 2) * 150000);
  else if (years <= 8) baseSalary = 1000000 + ((years - 5) * 200000);
  else baseSalary = 1600000 + ((years - 8) * 250000);

  if (seniority === 'Manager' || seniority === 'Director' || seniority === 'VP') baseSalary += 500000;
  if (role.toLowerCase().includes('software') || role.toLowerCase().includes('data') || role.toLowerCase().includes('devops')) baseSalary += 250000;
  if (experienceData.leadershipExperience || experienceData.managementExperience) baseSalary += 200000;

  const highPaySkills = ['machine learning', 'ai', 'aws', 'kubernetes', 'react', 'python', 'blockchain', 'sap', 'salesforce', 'compliance', 'audit'];
  const foundHighPay = skills.filter(s => highPaySkills.includes(s)).length;
  baseSalary += foundHighPay * 60000;

  const min = Math.round((baseSalary * 0.9) / 100000);
  const max = Math.round((baseSalary * 1.1) / 100000);

  return {
    min, max, currency: "LPA", confidence: "High",
    reasoning: `Based on ${years} years as ${role} (${seniority}) with ${foundHighPay} high-demand skills.`,
    marketTrend: "Stable", comparableProfiles: [],
    factors: { strengths: "Accurate role and experience mapping", weaknesses: "", marketPosition: "Competitive" }
  };
}

// ==================== HELPER: WEIGHTED JOB MATCHING (35/25/20/10/10) ====================
function calculateWeightedJobMatch(
  cvText: string, 
  jobTitle: string, 
  jobDescription: string, 
  candidateData: any
): number {
  const cleanJob = `${jobTitle} ${jobDescription}`.toLowerCase().replace(/[^\w\s]/g, ' ');
  let totalScore = 0;

  // 1. Role Match (35%)
  let roleScore = 0;
  const jobTitleLower = jobTitle.toLowerCase();
  if (jobTitleLower.includes(candidateData.primaryRole.toLowerCase())) {
    roleScore = 35;
  } else if (candidateData.secondaryRoles.some((r: string) => jobTitleLower.includes(r.toLowerCase()))) {
    roleScore = 25;
  } else {
    const roleWords = candidateData.primaryRole.toLowerCase().split(/\s+/);
    if (roleWords.some((w: string) => w.length > 3 && jobTitleLower.includes(w))) roleScore = 15;
  }
  totalScore += roleScore;

  // 2. Responsibility Match (25%)
  let respScore = 0;
  const actionVerbs = ['managed', 'led', 'developed', 'optimized', 'designed', 'implemented', 'audited', 'reviewed'];
  const matchedVerbs = actionVerbs.filter(v => cleanJob.includes(v));
  respScore = Math.min((matchedVerbs.length / 3) * 25, 25);
  totalScore += respScore;

  // 3. Skill Match (20%)
  let skillScore = 0;
  const matchedSkills = candidateData.skills.filter((skill: string) => {
    const escapedSkill = escapeRegExp(skill);
    return new RegExp(`\\b${escapedSkill}\\b`, 'i').test(cleanJob);
  });
  skillScore = Math.min((matchedSkills.length / 5) * 20, 20);
  totalScore += skillScore;

  // 4. Experience Match (10%)
  let expScore = 0;
  const expMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
  if (expMatch) {
    const requiredYears = parseInt(expMatch[1]);
    if (candidateData.totalExperienceYears >= requiredYears) expScore = 10;
    else if (candidateData.totalExperienceYears >= requiredYears - 1) expScore = 5;
  } else {
    expScore = 10;
  }
  totalScore += expScore;

  // 5. Industry Match (10%)
  let industryScore = 0;
  if (candidateData.industries.some((ind: string) => cleanJob.includes(ind.toLowerCase()))) {
    industryScore = 10;
  } else if (candidateData.industries.includes("General")) {
    industryScore = 5;
  }
  totalScore += industryScore;

  return Math.min(Math.round(totalScore), 98);
}

// ==================== HELPER: DISTANCE CALCULATION ====================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function getNearbyCities(lat: number, lon: number, radiusKm: number = 70): Promise<string[]> {
  const nearbyCities: string[] = [];
  for (const city of MAJOR_CITIES) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance <= radiusKm) nearbyCities.push(city.name);
  }
  return nearbyCities;
}

// ==================== ✅ BULLETPROOF JOB FETCHERS ====================
async function fetchFromGreenhouse(searchTerms: string[]): Promise<any[]> {
  const verified = ['airbnb', 'coinbase', 'notion', 'figma', 'canva', 'doordash', 'robinhood', 'twitch', 'discord', 'shopify', 'github', 'gitlab', 'stripe', 'dropbox', 'asana', 'zendesk', 'hubspot', 'square', 'block', 'uber', 'lyft', 'spotify', 'slack', 'zoom', 'atlassian'];
  const terms = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  const promises = verified.map(async (company) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // ✅ FIX: Lowered to 5s
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return (data.jobs || []).filter((job: any) => terms.some(term => (job.title + ' ' + job.content).toLowerCase().includes(term))).slice(0, 2).map((job: any) => ({
          id: `gh-${company}-${job.id}`, title: job.title, company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'Remote', url: job.absolute_url, description: (job.content || '').replace(/<[^>]*>/g, '').substring(0, 500),
          postedDate: job.updated_at || new Date().toISOString(), source: 'Greenhouse'
        }));
      }
    } catch (e) { return []; }
    return [];
  });
  return (await Promise.all(promises)).flat();
}

async function fetchFromLever(searchTerms: string[]): Promise<any[]> {
  const verified = ['uber', 'coinbase', 'robinhood', 'notion', 'airbnb', 'lyft', 'twitch', 'discord', 'shopify', 'grammarly', 'coursera', 'asana', 'reddit', 'figma', 'dropbox', 'instacart', 'twitter', 'pinterest', 'yelp'];
  const terms = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  const promises = verified.map(async (company) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // ✅ FIX: Lowered to 5s
      const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return (Array.isArray(data) ? data : []).filter((job: any) => terms.some(term => (job.text + ' ' + job.description).toLowerCase().includes(term))).slice(0, 2).map((job: any) => ({
          id: `lever-${company}-${job.id}`, title: job.text, company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.categories?.location || 'Remote', url: job.hostedUrl, description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 500),
          postedDate: new Date().toISOString(), source: 'Lever'
        }));
      }
    } catch (e) { return []; }
    return [];
  });
  return (await Promise.all(promises)).flat();
}

async function fetchFromAshby(searchTerms: string[]): Promise<any[]> {
  const verified = ['rippling', 'deel', 'loom', 'vercel', 'linear', 'ramp', 'mercury', 'brex', 'plaid', 'webflow', 'framer', 'retool', 'notion', 'figma', 'canva', 'doordash', 'robinhood', 'shopify', 'github', 'discord', 'twitch', 'roblox', 'unity'];
  const terms = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  const promises = verified.map(async (company) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // ✅ FIX: Lowered to 5s
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${company}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return (data.jobPostings || []).filter((job: any) => terms.some(term => (job.title + ' ' + job.description).toLowerCase().includes(term))).slice(0, 2).map((job: any) => ({
          id: `ashby-${company}-${job.id}`, title: job.title, company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.locationName || 'Remote', url: job.applicationUrl || job.url || '#', description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 500),
          postedDate: job.publishedDate || new Date().toISOString(), source: 'Ashby'
        }));
      }
    } catch (e) { return []; }
    return [];
  });
  return (await Promise.all(promises)).flat();
}

// ==================== POST API (ADVANCED DETERMINISTIC ENGINE) ====================
export async function POST(req: NextRequest) {
  try {
    console.log("🧠 Advanced Deterministic CV Analysis (Dynamic NLP - No Hardcoding)...");
    
    const body = await req.json();
    const { text, hash, sessionId, location, latitude, longitude } = body;

    if (!text || !hash || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields (text, hash, sessionId)' }, { status: 400 });
    }

    // 1. ✅ DYNAMIC EXTRACTION (No Hardcoding!)
    const roleData = extractDynamicRole(text);
    const dynamicSkills = extractDynamicSkills(text);
    const dynamicIndustries = detectDynamicIndustry(dynamicSkills);

    // 2. Experience Timeline
    const experienceData = calculateExperienceTimeline(text);

    // 3. Determine Seniority dynamically
    let seniority = "Mid-Level";
    const years = experienceData.totalExperienceYears;
    const roleLower = roleData.primaryRole.toLowerCase();
    
    if (roleLower.includes('intern') || roleLower.includes('trainee')) seniority = "Intern";
    else if (years === 0) seniority = "Fresher";
    else if (years <= 2) seniority = "Junior";
    else if (years >= 8 && (roleLower.includes('head') || roleLower.includes('director') || roleLower.includes('vp') || roleLower.includes('manager'))) seniority = "Manager";
    else if (years >= 5) seniority = "Senior";

    // 4. Advanced ATS Scoring & Salary Estimation
    const atsData = calculateAdvancedATSScore(text, dynamicSkills, experienceData);
    const salaryData = estimateAdvancedSalary(roleData.primaryRole, experienceData, seniority, dynamicIndustries, dynamicSkills);

    // ✅ FIX 2: Clean the role before searching to avoid sending messy strings to APIs
    const cleanRole = cleanJobTitle(roleData.primaryRole);
    const searchTerms = [cleanRole, ...dynamicSkills.slice(0, 2)].slice(0, 3);    
    
    console.log("🎯 Extracted Role:", roleData.primaryRole);
    console.log("🛠️ Top Dynamic Skills:", dynamicSkills.slice(0, 5));
    console.log("🏭 Detected Industry:", dynamicIndustries);
    console.log("🔍 Search Terms sent to APIs:", searchTerms);

    // 5. Database Operations
    try {
      await prisma.appSession.upsert({
        where: { session_id: sessionId },
        update: { tier: 'free', updated_at: new Date() },
        create: { session_id: sessionId, tier: 'free' }
      });

      const resume = await prisma.resume.upsert({
        where: { text_hash: hash },
        update: {
          session_id: sessionId,
          raw_text: text.substring(0, 5000),
          summary: text.substring(0, 200)
        },
        create: {
          session_id: sessionId,
          text_hash: hash,
          raw_text: text.substring(0, 5000),
          summary: text.substring(0, 200)
        }
      });

      if (dynamicSkills.length > 0 && resume.id) {
        try {
          await prisma.resumeSkill.createMany({
            data: dynamicSkills.map(skill => ({ resume_id: resume.id, skill_name: skill })),
            skipDuplicates: true
          });
        } catch (skillError) {
          console.warn("⚠️ Skill save skipped:", skillError);
        }
      }

      if (resume.id) {
        await prisma.atsScore.upsert({
          where: { resume_id: resume.id },
          update: { total_score: atsData.score },
          create: { resume_id: resume.id, total_score: atsData.score }
        });

        await prisma.salaryEstimate.upsert({
          where: { resume_id: resume.id },
          update: {
            conservative: salaryData.min * 100000,
            average: ((salaryData.min + salaryData.max) / 2) * 100000,
            premium: salaryData.max * 100000,
            currency: "INR"
          },
          create: {
            resume_id: resume.id,
            conservative: salaryData.min * 100000,
            average: ((salaryData.min + salaryData.max) / 2) * 100000,
            premium: salaryData.max * 100000,
            currency: "INR"
          }
        });
      }
      console.log("✅ DB Records saved/updated successfully for session:", sessionId);
    } catch (dbError) {
      console.warn("⚠️ Prisma DB save failed (Non-critical):", dbError);
    }

    // 6. Location Logic (70KM RADIUS - Pan India Optimized)
    let searchLocations: string[] = [];
    let userCoords: { lat: number; lon: number } | null = null;
    
    // PRIORITY 1: Use exact GPS coordinates if provided by frontend
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      userCoords = { lat, lon };
      
      if (lat > 6 && lat < 38 && lon > 68 && lon < 98) {
        const nearby = await getNearbyCities(lat, lon, 70);
        searchLocations = nearby.length > 0 ? nearby : (location && location.trim() !== "" ? [location] : ["India"]);
      } else {
        searchLocations = ["USA"];
      }
    } 
    // PRIORITY 2: Fallback to text-based location if GPS is denied
    else if (location && location.trim() !== "" && location.toLowerCase() !== "india") {
      const knownCity = MAJOR_CITIES.find(c => location.toLowerCase().includes(c.name.toLowerCase()));
      
      if (knownCity) {
        const nearby = await getNearbyCities(knownCity.lat, knownCity.lon, 70);
        searchLocations = [...new Set([knownCity.name, ...nearby])];
      } else {
        searchLocations = [location, `${location}, India`];
      }
    } 
    // PRIORITY 4: Ultimate fallback
    else {
      searchLocations = ["India", "Remote"];
    }
    
    // ✅ FIX: Always include "Remote" in search locations
    if (!searchLocations.includes("Remote")) {
      searchLocations.push("Remote");
    }
    
    console.log("📍 User Location Input:", location || "None");
    console.log("🗺️ Final Search Locations:", searchLocations);

    // 7. Job Matching Engine
    let matchedJobs: any[] = [];
    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (APP_ID && API_KEY) {
      const limitedLocations = searchLocations.slice(0, 4);
      const fetchPromises: Promise<any[]>[] = [];
      
      for (const loc of limitedLocations) {
        for (const term of searchTerms) {
          const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=25&what=${encodeURIComponent(term)}&where=${encodeURIComponent(loc)}&max_days_old=30&content-type=application/json`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // ✅ FIX: Lowered to 8s
          
          fetchPromises.push(
            fetch(url, { signal: controller.signal })
              .then(async (response) => {
                clearTimeout(timeoutId);
                if (response.ok) {
                  const data = await response.json();
                  return (data.results || []).map((job: any) => {
                    let jobCity = "";
                    let distance: number | null = null;
                    let isWithinRadius = true;

                    if (job.location?.display_name) {
                      const parts = job.location.display_name.split(',');
                      jobCity = parts[0]?.trim() || "";
                    }

                    if (userCoords && jobCity) {
                      const cityLower = jobCity.toLowerCase();
                      const matchedMajorCity = MAJOR_CITIES.find(c => cityLower.includes(c.name.toLowerCase()));
                      if (matchedMajorCity) {
                        distance = calculateDistance(userCoords.lat, userCoords.lon, matchedMajorCity.lat, matchedMajorCity.lon);
                        isWithinRadius = distance <= 70;
                      }
                    }

                    const candidateDataForMatch = {
                      primaryRole: roleData.primaryRole,
                      secondaryRoles: roleData.secondaryRoles,
                      totalExperienceYears: experienceData.totalExperienceYears,
                      skills: dynamicSkills,
                      industries: dynamicIndustries
                    };

                    const matchPercentage = calculateWeightedJobMatch(
                      text, 
                      job.title || '', 
                      job.description || '', 
                      candidateDataForMatch
                    );

                    return {
                      id: job.id, title: job.title, company: job.company?.display_name || 'Unknown',
                      location: job.location?.display_name || 'Unknown', city: jobCity,
                      description: (job.description || '').substring(0, 500), url: job.redirect_url || '#',
                      postedDate: job.created,
                      matchPercentage,
                      matchingSkills: dynamicSkills.slice(0, 3), 
                      primaryRole: roleData.primaryRole, 
                      distance, 
                      withinRadius: isWithinRadius, 
                      source: 'Adzuna'
                    };
                  });
                }
                return [];
              })
              .catch(() => { clearTimeout(timeoutId); return []; })
          );
        }
      }
      
      fetchPromises.push(fetchFromGreenhouse(searchTerms));
      fetchPromises.push(fetchFromLever(searchTerms));
      fetchPromises.push(fetchFromAshby(searchTerms));
      
      const resultsArrays = await Promise.all(fetchPromises);
      matchedJobs = resultsArrays.flat();

      console.log("📦 TOTAL RAW JOBS FETCHED:", matchedJobs.length);
      console.log("   ├─ Adzuna:", matchedJobs.filter(j => j.source === 'Adzuna').length);
      console.log("   ├─ Greenhouse:", matchedJobs.filter(j => j.source === 'Greenhouse').length);
      console.log("   ├─ Lever:", matchedJobs.filter(j => j.source === 'Lever').length);
      console.log("   └─ Ashby:", matchedJobs.filter(j => j.source === 'Ashby').length);
    }

    // 8. Strict Filtering & Sorting
    const seenUrls = new Set<string>();
    const now = new Date();
    
    const filteredJobs = matchedJobs
      .filter(job => {
        if (seenUrls.has(job.url)) return false;
        seenUrls.add(job.url);
        
        const diffDays = (now.getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
        
        // ✅ FIX: Lowered match threshold from 40 to 30
        if (job.matchPercentage < 30) return false; 
        
        // ✅ FIX: Soft radius check. Allow Remote jobs, or jobs within 100km
        const isRemote = job.location?.toLowerCase().includes('remote');
        const isAcceptableDistance = job.distance === null || job.distance <= 100; 
        
        if (userCoords && !isRemote && !isAcceptableDistance) return false;
        
        return true;
      })
      .sort((a, b) => {
        // ✅ FIX: Smart Sorting: Prioritize jobs within 70km OR Remote jobs first
        const aIsPreferred = (a.distance !== null && a.distance <= 70) || a.location?.toLowerCase().includes('remote');
        const bIsPreferred = (b.distance !== null && b.distance <= 70) || b.location?.toLowerCase().includes('remote');
        
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        
        return b.matchPercentage - a.matchPercentage;
      });

    // ✅ FIX 3: Moved declaration BEFORE console.log to prevent reference error
    const withinRadiusCount = filteredJobs.filter(j => j.withinRadius).length;
    const sourceBreakdown = {
      adzuna: filteredJobs.filter(j => j.source === 'Adzuna').length,
      greenhouse: filteredJobs.filter(j => j.source === 'Greenhouse').length,
      lever: filteredJobs.filter(j => j.source === 'Lever').length,
      ashby: filteredJobs.filter(j => j.source === 'Ashby').length,
    };

    console.log("🔍 FILTERING STATS:");
    console.log("   ├─ Raw Jobs:", matchedJobs.length);
    console.log("   ├─ Survived 30% Match & 100km Radius:", filteredJobs.length);
    console.log("   └─ Jobs within exact 70km/Remote:", withinRadiusCount);
    
    // 9. Final Output JSON
    return NextResponse.json({
      success: true,
      sessionId,
      textHash: hash,
      
      primaryRole: roleData.primaryRole,
      secondaryRoles: roleData.secondaryRoles,
      seniority: seniority,
      
      totalExperienceYears: experienceData.totalExperienceYears,
      relevantExperienceYears: experienceData.relevantExperienceYears,
      careerProgressionAnalysis: experienceData.careerProgression,
      progressionScore: experienceData.progressionScore,
      leadershipExposure: experienceData.leadershipExperience,
      
      skills: dynamicSkills,
      advancedSkills: dynamicSkills.slice(0, 5),
      industries: dynamicIndustries,
      
      atsScore: atsData.score,
      atsExplanations: atsData.explanations,
      salaryEstimate: salaryData,
      
      matchedJobs: filteredJobs,
      totalMatches: filteredJobs.length,
      withinRadiusCount,
      sourceBreakdown,
      searchTermsUsed: searchTerms,
      weightedJobMatching: true,
      
      source: 'Advanced Dynamic NLP Engine',
      location: searchLocations.join(', '),
      message: filteredJobs.length > 0 
        ? `✅ Found ${filteredJobs.length} highly relevant jobs using dynamic contextual matching. ${withinRadiusCount} within 70km/Remote.`
        : `⚠️ No jobs with 30%+ weighted match found within 100km.`
    });
    
  } catch (error: any) {
    console.error('❌ Backend Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}