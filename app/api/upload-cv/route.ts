import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';
import { prisma } from '@/lib/prisma';

// ==================== CONSTANTS: ALL MAJOR INDIAN CITIES FOR 70KM RADIUS ====================
const MAJOR_CITIES = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Noida", lat: 28.5355, lon: 77.3910 },
  { name: "Greater Noida", lat: 28.4744, lon: 77.5040 },
  { name: "Gurgaon", lat: 28.4595, lon: 77.0266 },
  { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Thane", lat: 19.2183, lon: 72.9781 },
  { name: "Navi Mumbai", lat: 19.0330, lon: 73.0297 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Patna", lat: 25.6093, lon: 85.1376 },
  { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
  { name: "Nashik", lat: 19.9975, lon: 73.7898 },
  { name: "Meerut", lat: 28.9845, lon: 77.7064 },
  { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
  { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
  { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
  { name: "Allahabad", lat: 25.4358, lon: 81.8463 },
  { name: "Prayagraj", lat: 25.4358, lon: 81.8463 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Howrah", lat: 22.5958, lon: 88.2636 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
  { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.6480 },
  { name: "Jodhpur", lat: 26.2389, lon: 73.0243 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Kota", lat: 25.2138, lon: 75.8648 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Mangalore", lat: 12.9141, lon: 74.8560 },
  { name: "Jammu", lat: 32.7266, lon: 74.8570 },
  { name: "Goa", lat: 15.2993, lon: 74.1240 },
  { name: "Panaji", lat: 15.4909, lon: 73.8278 },
];

const INDUSTRY_COMPANIES: Record<string, string[]> = {
  'Technology': ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'airbnb', 'spotify', 'adobe', 'salesforce', 'oracle', 'sap', 'ibm', 'intel', 'nvidia', 'amd', 'qualcomm', 'cisco', 'vmware', 'atlassian', 'github', 'stripe', 'shopify', 'slack', 'zoom', 'dropbox', 'twilio', 'datadog', 'snowflake', 'databricks', 'palantir', 'crowdstrike', 'palo-alto-networks', 'fortinet', 'zscaler', 'cloudflare', 'fastly', 'vercel', 'hashicorp', 'elastic', 'mongodb', 'confluent', 'redis', 'gitlab', 'figma', 'canva', 'notion', 'airtable'],
  'Finance': ['jpmorgan', 'goldman-sachs', 'morgan-stanley', 'citigroup', 'bank-of-america', 'wells-fargo', 'hsbc', 'barclays', 'deutsche-bank', 'ubs', 'credit-suisse', 'blackrock', 'vanguard', 'fidelity', 'schwab', 'american-express', 'visa', 'mastercard', 'paypal', 'stripe', 'square', 'plaid', 'brex', 'ramp', 'mercury', 'coinbase', 'robinhood', 'block', 'sofi', 'chime'],
  'Healthcare': ['unitedhealth', 'johnson-johnson', 'pfizer', 'roche', 'novartis', 'merck', 'abbvie', 'bristol-myers', 'gilead', 'amgen', 'biogen', 'moderna', 'bioNTech', 'thermo-fisher', 'danaher', 'becton-dickinson', 'medtronic', 'abbott', 'boston-scientific', 'stryker', 'zimmer-biomet', 'intuitive-surgical', 'veracyte', '10x-genomics', 'illumina', 'pacific-biosciences', 'guardant-health', 'tempus', 'flatiron-health'],
  'E-commerce': ['amazon', 'shopify', 'ebay', 'etsy', 'wayfair', 'overstock', 'chewy', 'instacart', 'doordash', 'uber-eats', 'grubhub', 'postmates', 'walmart', 'target', 'costco', 'best-buy', 'home-depot', 'lowes', 'nordstrom', 'macys', 'zappos', 'poshmark', 'mercari', 'depop', 'stockx', 'goat', 'farfetch', 'luxe', 'the-realreal'],
  'Consulting': ['mckinsey', 'bcg', 'bain', 'accenture', 'deloitte', 'pwc', 'ey', 'kpmg', 'oliver-wyman', 'kearney', 'l-e-k', 'alixpartners', 'fti-consulting', 'huron', 'alvarez-marsal', 'protiviti', 'grant-thornton', 'bdo', 'rsm', 'crowe'],
  'General': ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'airbnb', 'spotify', 'adobe', 'salesforce', 'oracle', 'ibm', 'intel', 'nvidia', 'cisco', 'atlassian', 'github', 'stripe', 'shopify', 'jpmorgan', 'goldman-sachs', 'accenture', 'deloitte', 'pwc', 'ey', 'kpmg', 'walmart', 'target', 'costco'],
};

// ==================== HELPER: ROBUST JSON EXTRACTOR ====================
function extractJsonFromText(text: string): any {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) {}
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch (e) { throw new Error("Failed to parse JSON"); }
  }
  throw new Error("No valid JSON found");
}

// ==================== READ FILE CONTENT ====================
async function readFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(new Error(errData.parserError || "PDF Error")));
      pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));
      pdfParser.parseBuffer(buffer);
    });
    if (text.trim().length > 0) return text;
    throw new Error("Empty PDF");
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer: buffer });
    const text = result.value || "";
    if (text.trim().length > 0) return text;
    throw new Error("Empty DOCX");
  }
  
  if (fileName.endsWith('.txt')) return buffer.toString('utf-8');
  throw new Error("Unsupported format");
}

// ==================== PERFECT NAME EXTRACTION ====================
function extractNameFromText(text: string, filename: string): string {
  const fileNameHint = filename.replace(/\.(pdf|docx|doc|txt)$/i, '').trim();
  const nameFromFilename = fileNameHint.split(/[_\-\s]+/)[0];
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3 && l.length < 60);
  const blacklist = [
    'resume', 'curriculum', 'vitae', 'objective', 'summary', 'profile',
    'experience', 'education', 'skills', 'projects', 'certifications', 'awards',
    'references', 'contact', 'phone', 'email', 'address', 'linkedin', 'github',
    'career', 'goal', 'statement', 'work', 'history', 'employment'
  ];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    const cleanLine = line.replace(/[,:;|•●►→\-\*]/g, '').trim();
    const words = cleanLine.split(/\s+/).filter(w => w.length > 1);
    
    if (words.length >= 2 && words.length <= 4) {
      const firstWord = words[0];
      const isBlacklisted = blacklist.includes(firstWord.toLowerCase());
      const isTitleCase = firstWord[0] === firstWord[0].toUpperCase() && firstWord.slice(1) === firstWord.slice(1).toLowerCase();
      const isNotEmail = !firstWord.includes('@');
      const isNotPhone = !/^\+?[\d\s\-\(\)]{7,}$/.test(firstWord);
      const isNotUrl = !firstWord.startsWith('http') && !firstWord.includes('.com') && !firstWord.includes('.in');
      
      if (isTitleCase && !isBlacklisted && isNotEmail && isNotPhone && isNotUrl) {
        return firstWord;
      }
    }
  }
  
  if (nameFromFilename && nameFromFilename.length >= 2) {
    return nameFromFilename.charAt(0).toUpperCase() + nameFromFilename.slice(1).toLowerCase();
  }
  
  return "Candidate";
}

// ==================== EXTRACT COMPANIES FROM CV ====================
function extractCompaniesFromCV(text: string): string[] {
  const companies: string[] = [];
  const companyPatterns = [
    /(?:at|@|,)\s*([A-Z][a-zA-Z0-9&\- ]{2,30})(?:\s*\||\s*,|\s*\n)/g,
    /([A-Z][a-zA-Z0-9&\-]{2,30})\s+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Technologies|Systems|Solutions|Services|Software|Labs|Studio|Studios|Group|Holdings|International|Global|Digital|Networks|Media|Communications|Consulting|Partners|Associates|Advisors|Capital|Ventures|Industries|Manufacturing|Engineering|Design|Analytics|Data|AI|Cloud|Security|Health|Healthcare|Finance|Financial|Bank|Banking|Insurance|Retail|E-commerce|Pharma|Biotech|Biotechnology|Automotive|Energy|Power|Telecom|Telecommunications|Media|Entertainment|Gaming|Education|EdTech|FinTech|HealthTech|PropTech|Food|FoodTech|Travel|TravelTech|Logistics|Supply Chain|Agriculture|AgriTech|Construction|Real Estate)/g,
  ];
  
  for (const pattern of companyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const company = match[1].trim();
      if (company.length > 2 && company.length < 30) {
        companies.push(company);
      }
    }
  }
  
  const falsePositives = ['Experience', 'Education', 'Skills', 'Projects', 'Certifications', 'Awards', 'References', 'Summary', 'Objective', 'Profile', 'Contact', 'Phone', 'Email', 'Address', 'LinkedIn', 'GitHub', 'Portfolio', 'Website', 'Location', 'Date', 'Present', 'Current', 'Previous', 'Former', 'Intern', 'Internship', 'Freelance', 'Freelancer', 'Self-employed', 'Independent', 'Consultant', 'Contractor'];
  
  return [...new Set(companies)]
    .filter(c => !falsePositives.includes(c))
    .filter(c => !/^\d+$/.test(c))
    .slice(0, 10);
}

// ==================== ENHANCED DEEP CV ANALYSIS (GROQ WITH QWEN 3.8 27B) ====================
async function analyzeCVWithGroq(text: string, filename: string): Promise<any> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return fallbackAnalysis(text, filename);

    const perfectName = extractNameFromText(text, filename);
    const companiesFromCV = extractCompaniesFromCV(text);

    const prompt = `You are an Elite Technical Recruiter & Compensation Analyst. Analyze this CV with EXTREME PRECISION.

CRITICAL TASKS:
1. CANDIDATE NAME: The candidate's first name is likely "${perfectName}". Confirm this from the CV text and return ONLY the first name.
2. DEEP PROFILE EXTRACTION:
   - Exact current designation
   - Seniority: Junior(0-2yr)/Mid(2-5yr)/Senior(5-8yr)/Lead(8-12yr)/Manager(10-15yr)/Director(15+yr)/VP(20+yr)
   - Industry vertical (be specific: "Fintech", "SaaS", "Healthcare IT")
   - Domain expertise (3-5 specific domains like "Payments", "Cloud Infrastructure", "Machine Learning")
   - Company pedigree: FAANG/Product/Service/Startup/Enterprise/MNC
   - Technical skills (8-12 specific hard skills)
   - Tools & frameworks (5-8 specific tools)
   - Core Responsibilities (3-4 key phrases describing what they actually DID, e.g., "Managed cross-functional teams", "Optimized database queries")
   - Certifications & Education level
3. SALARY ESTIMATION (MARKET-BASED):
   - Use 2024-2025 Indian market data
   - Consider: role seniority, niche skills, company pedigree, industry demand
   - TIGHT range only: max 20% gap between min-max
4. JOB SEARCH OPTIMIZATION:
   - 3-5 specific job titles to search
   - Target companies (from CV + industry leaders)

RETURN STRICT JSON ONLY:
{
  "candidateFirstName": "First name",
  "candidateFullName": "Full name if available",
  "primaryRole": "Exact current designation",
  "secondaryRoles": ["alt title 1", "alt title 2"],
  "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "toolsAndFrameworks": ["tool1", "tool2", "tool3"],
  "coreResponsibilities": ["responsibility phrase 1", "responsibility phrase 2", "responsibility phrase 3"],
  "experienceYears": 5,
  "seniorityLevel": "Senior",
  "industry": "Specific industry vertical",
  "domainExpertise": ["domain1", "domain2", "domain3"],
  "companyPedigree": "Product",
  "certifications": ["cert1"],
  "educationLevel": "Bachelors/Masters/PhD",
  "summary": "2-line professional summary",
  "searchTerms": ["job title 1", "job title 2", "job title 3"],
  "targetCompanies": ["company1", "company2", "company3", "company4", "company5"],
  "salaryEstimate": {
    "min": 12,
    "max": 14,
    "currency": "LPA",
    "confidence": "High",
    "reasoning": "Detailed reasoning",
    "marketTrend": "Growing",
    "comparableProfiles": ["Profile 1: ₹X-Y LPA"],
    "factors": {"strengths": "", "weaknesses": "", "marketPosition": ""}
  },
  "negotiationTip": "Specific actionable tip",
  "idealJobProfile": "Ideal next role description"
}

Resume text:
${text.substring(0, 7000)}`;

    console.log("⚡ Using Groq API (Model: qwen/qwen3.8-27b, max_tokens: 1000) for CV Analysis...");
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown, no explanations outside JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000, // ✅ FIX: Reduced to 1000 to comply with free tier OTPM limit
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("❌ Groq API Error:", groqRes.status, errorText);
      return fallbackAnalysis(text, filename);
    }

    const groqData = await groqRes.json();
    if (!groqData.choices || !groqData.choices[0]) return fallbackAnalysis(text, filename);

    const text_response = groqData.choices[0].message.content || "";
    
    let parsed: any;
    try {
      parsed = extractJsonFromText(text_response);
    } catch (parseError) {
      console.error("❌ JSON Parsing Error:", parseError);
      return fallbackAnalysis(text, filename);
    }
    
    let salaryEstimate = parsed.salaryEstimate;
    if (!salaryEstimate || !salaryEstimate.min || !salaryEstimate.max || salaryEstimate.min === 0) {
      const exp = parsed.experienceYears || 3;
      const baseMin = Math.max(3, exp * 3);
      const baseMax = Math.round(baseMin * 1.2);
      salaryEstimate = {
        min: baseMin, max: baseMax, currency: "LPA", confidence: "Medium",
        reasoning: `Estimated based on ${exp} years experience and market data`,
        marketTrend: "Stable", comparableProfiles: [], factors: { strengths: "", weaknesses: "", marketPosition: "" }
      };
    }
    
    const rangeRatio = salaryEstimate.max / salaryEstimate.min;
    if (rangeRatio > 1.25) {
      salaryEstimate.max = Math.round(salaryEstimate.min * 1.2);
    }

    const targetCompaniesFromAI = Array.isArray(parsed.targetCompanies) ? parsed.targetCompanies : [];
    const industryCompanies = INDUSTRY_COMPANIES[parsed.industry] || INDUSTRY_COMPANIES['General'];
    const allTargetCompanies = [...new Set([...companiesFromCV, ...targetCompaniesFromAI, ...industryCompanies])].slice(0, 25);

    console.log("🧠 Deep CV Analysis Complete:");
    console.log("👤 Candidate:", parsed.candidateFirstName || perfectName);
    console.log("💰 Salary: ₹", salaryEstimate.min, "- ₹", salaryEstimate.max, salaryEstimate.currency);

    return {
      candidateFirstName: parsed.candidateFirstName || perfectName,
      candidateFullName: parsed.candidateFullName || perfectName,
      primaryRole: parsed.primaryRole || 'Professional',
      secondaryRoles: Array.isArray(parsed.secondaryRoles) ? parsed.secondaryRoles : [],
      keySkills: Array.isArray(parsed.keySkills) ? parsed.keySkills : [],
      toolsAndFrameworks: Array.isArray(parsed.toolsAndFrameworks) ? parsed.toolsAndFrameworks : [],
      coreResponsibilities: Array.isArray(parsed.coreResponsibilities) ? parsed.coreResponsibilities : [],
      experienceYears: parsed.experienceYears || 3,
      seniorityLevel: parsed.seniorityLevel || 'Mid',
      domainExpertise: Array.isArray(parsed.domainExpertise) ? parsed.domainExpertise : [],
      companyPedigree: parsed.companyPedigree || 'Service',
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      educationLevel: parsed.educationLevel || 'Bachelors',
      industry: parsed.industry || 'Technology',
      summary: parsed.summary || 'Professional with relevant experience',
      searchTerms: Array.isArray(parsed.searchTerms) ? parsed.searchTerms : [parsed.primaryRole],
      targetCompanies: allTargetCompanies,
      salaryEstimate: salaryEstimate,
      negotiationTip: parsed.negotiationTip || "Highlight your key achievements and market value.",
      idealJobProfile: parsed.idealJobProfile || ''
    };
  } catch (error) {
    console.error("❌ Groq Analysis Error:", error);
    return fallbackAnalysis(text, filename);
  }
}

// ==================== FALLBACK ANALYSIS ====================
function fallbackAnalysis(text: string, filename: string): any {
  const perfectName = extractNameFromText(text, filename);
  const companiesFromCV = extractCompaniesFromCV(text);
  
  let experienceYears = 3;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (expMatch) experienceYears = parseFloat(expMatch[1]);

  let seniorityLevel = 'Mid';
  if (experienceYears < 2) seniorityLevel = 'Junior';
  else if (experienceYears < 5) seniorityLevel = 'Mid';
  else if (experienceYears < 8) seniorityLevel = 'Senior';
  else if (experienceYears < 12) seniorityLevel = 'Lead';
  else if (experienceYears < 15) seniorityLevel = 'Manager';
  else seniorityLevel = 'Director';

  const baseMin = Math.max(3, experienceYears * 3);
  const baseMax = Math.round(baseMin * 1.2);
  const industryCompanies = INDUSTRY_COMPANIES['General'];

  return {
    candidateFirstName: perfectName,
    candidateFullName: perfectName,
    primaryRole: "Professional",
    secondaryRoles: [],
    keySkills: [],
    toolsAndFrameworks: [],
    coreResponsibilities: [],
    experienceYears,
    seniorityLevel,
    domainExpertise: [],
    companyPedigree: 'Service',
    certifications: [],
    educationLevel: 'Bachelors',
    industry: 'Technology',
    summary: "Profile analyzed",
    searchTerms: ["Professional"],
    targetCompanies: [...new Set([...companiesFromCV, ...industryCompanies])].slice(0, 25),
    salaryEstimate: { 
      min: baseMin, max: baseMax, currency: "LPA", confidence: "Medium",
      reasoning: `Based on ${experienceYears} years experience`,
      marketTrend: "Stable", comparableProfiles: [], factors: { strengths: "", weaknesses: "", marketPosition: "" }
    },
    negotiationTip: "Focus on your adaptability and willingness to learn.",
    idealJobProfile: ''
  };
}

// ==================== 🚀 CONTEXTUAL MATCH PERCENTAGE (MIN 50%) ====================
function calculateMatchPercentage(jobTitle: string, jobDescription: string, aiAnalysis: any): number {
  const jobTitleLower = jobTitle.toLowerCase();
  const jobDescLower = jobDescription.toLowerCase();
  const combinedText = jobTitleLower + ' ' + jobDescLower;
  let score = 0;
  let maxScore = 0;
  
  // 1. Job Title Semantic Match (Weight: 40 points)
  maxScore += 40;
  const primaryRoleWords = aiAnalysis.primaryRole.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const titleMatches = primaryRoleWords.filter((word: string) => jobTitleLower.includes(word)).length;
  if (titleMatches >= 2) score += 40;
  else if (titleMatches === 1) score += 25;
  
  for (const role of aiAnalysis.secondaryRoles) {
    const roleWords = role.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    if (roleWords.some((w: string) => jobTitleLower.includes(w))) {
      score += 15;
      break;
    }
  }
  
  // 2. Core Responsibilities & Context Match (Weight: 30 points)
  maxScore += 30;
  const responsibilities = aiAnalysis.coreResponsibilities || [];
  if (responsibilities.length > 0) {
    let respScore = 0;
    for (const resp of responsibilities) {
      const respWords = resp.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
      const matches = respWords.filter((w: string) => jobDescLower.includes(w)).length;
      if (matches >= 2) respScore += 10;
      else if (matches === 1) respScore += 5;
    }
    score += Math.min(respScore, 30);
  } else {
    const allSkills = [...(aiAnalysis.keySkills || []), ...(aiAnalysis.toolsAndFrameworks || [])];
    const matchedSkills = allSkills.filter((skill: string) => combinedText.includes(skill.toLowerCase()));
    score += (matchedSkills.length / Math.max(allSkills.length, 1)) * 30;
  }
  
  // 3. Domain & Industry Alignment (Weight: 20 points)
  maxScore += 20;
  const domainExpertise = aiAnalysis.domainExpertise || [];
  const industryLower = (aiAnalysis.industry || '').toLowerCase();
  let domainScore = 0;
  if (domainExpertise.length > 0) {
    const matchedDomains = domainExpertise.filter((d: string) => combinedText.includes(d.toLowerCase()));
    domainScore += (matchedDomains.length / domainExpertise.length) * 15;
  }
  if (industryLower && combinedText.includes(industryLower)) {
    domainScore += 5;
  }
  score += domainScore;
  
  // 4. Seniority Alignment (Weight: 10 points)
  maxScore += 10;
  const seniorityLower = (aiAnalysis.seniorityLevel || 'mid').toLowerCase();
  const seniorityKeywords: Record<string, string[]> = {
    'junior': ['junior', 'entry', 'fresher', 'associate', 'jr', 'i'],
    'mid': ['mid', 'mid-level', 'intermediate', 'ii'],
    'senior': ['senior', 'sr', 'sr.', 'iii', 'staff'],
    'lead': ['lead', 'principal', 'tech lead'],
    'manager': ['manager', 'engineering manager', 'product manager'],
    'director': ['director', 'head of', 'vp', 'vice president'],
  };
  const expectedKeywords = seniorityKeywords[seniorityLower] || [];
  if (expectedKeywords.some((kw: string) => combinedText.includes(kw))) {
    score += 10;
  } else if (seniorityLower === 'mid') {
    score += 5;
  }
  
  const percentage = (score / maxScore) * 100;
  let finalPercentage = Math.round(percentage);
  if (finalPercentage >= 75) finalPercentage = Math.min(finalPercentage + 5, 98);
  
  return Math.max(finalPercentage, 0);
}

// ==================== DISTANCE CALCULATION ====================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ==================== GET NEARBY CITIES (70KM RADIUS) ====================
async function getNearbyCities(lat: number, lon: number, radiusKm: number = 70): Promise<string[]> {
  const nearbyCities: string[] = [];
  for (const city of MAJOR_CITIES) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance <= radiusKm) {
      nearbyCities.push(city.name);
    }
  }
  return nearbyCities;
}

// ==================== ✅ BULLETPROOF GREENHOUSE FETCHER ====================
async function fetchFromGreenhouse(targetCompanies: string[], searchTerms: string[]): Promise<any[]> {
  const verifiedGreenhouseCompanies = [
    'airbnb', 'coinbase', 'notion', 'figma', 'canva', 'doordash', 'robinhood', 
    'twitch', 'discord', 'shopify', 'github', 'gitlab', 'coursera', 'buzzfeed',
    'stripe', 'dropbox', 'trello', 'asana', 'zendesk', 'hubspot', 'square', 'block'
  ];

  const termsToSearch = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  console.log(`🟢 Greenhouse: Searching for terms: ${termsToSearch.join(', ')}`);

  const fetchPromises = verifiedGreenhouseCompanies.map(async (company) => {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'jobswitchers/1.0' } });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const jobs = data.jobs || [];
        
        const matchedJobs = jobs.filter((job: any) => {
          const title = (job.title || '').toLowerCase();
          const content = (job.content || '').toLowerCase();
          return termsToSearch.some(term => {
            const termWords = term.split(/\s+/).filter(w => w.length > 3);
            return termWords.some(word => title.includes(word)) || title.includes(term) || content.includes(term);
          });
        });

        const finalJobs = matchedJobs.length > 0 ? matchedJobs : jobs.slice(0, 2);

        return finalJobs.map((job: any) => ({
          id: `greenhouse-${company}-${job.id}`,
          title: job.title || 'Unknown',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'Remote',
          url: job.absolute_url || `https://boards.greenhouse.io/${company}/jobs/${job.id}`,
          description: (job.content || '').replace(/<[^>]*>/g, '').substring(0, 1000),
          postedDate: job.updated_at || new Date().toISOString(),
          source: 'Greenhouse',
        }));
      }
    } catch (e) { /* skip */ }
    return [];
  });
  
  const results = await Promise.all(fetchPromises);
  const flatResults = results.flat();
  console.log(`🟢 Greenhouse: Found ${flatResults.length} jobs`);
  return flatResults;
}

// ==================== ✅ BULLETPROOF LEVER FETCHER ====================
async function fetchFromLever(targetCompanies: string[], searchTerms: string[]): Promise<any[]> {
  const verifiedLeverCompanies = [
    'uber', 'coinbase', 'robinhood', 'notion', 'airbnb', 'lyft', 'twitch', 
    'discord', 'shopify', 'grammarly', 'coursera', 'asana', 'reddit', 'figma',
    'dropbox', 'trello', 'zendesk', 'hubspot', 'square', 'block', 'instacart'
  ];

  const termsToSearch = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  console.log(`🟡 Lever: Searching for terms: ${termsToSearch.join(', ')}`);

  const fetchPromises = verifiedLeverCompanies.map(async (company) => {
    try {
      const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'jobswitchers/1.0' } });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : [];
        
        const matchedJobs = jobs.filter((job: any) => {
          const title = (job.text || '').toLowerCase();
          const description = (job.description || '').toLowerCase();
          return termsToSearch.some(term => {
            const termWords = term.split(/\s+/).filter(w => w.length > 3);
            return termWords.some(word => title.includes(word)) || title.includes(term) || description.includes(term);
          });
        });

        const finalJobs = matchedJobs.length > 0 ? matchedJobs : jobs.slice(0, 2);

        return finalJobs.map((job: any) => ({
          id: `lever-${company}-${job.id}`,
          title: job.text || 'Unknown',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.categories?.location || 'Remote',
          url: job.hostedUrl || `https://jobs.lever.co/${company}/${job.id}`,
          description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 1000),
          postedDate: new Date().toISOString(),
          source: 'Lever',
        }));
      }
    } catch (e) { /* skip */ }
    return [];
  });
  
  const results = await Promise.all(fetchPromises);
  const flatResults = results.flat();
  console.log(`🟡 Lever: Found ${flatResults.length} jobs`);
  return flatResults;
}

// ==================== ✅ BULLETPROOF ASHBY FETCHER ====================
async function fetchFromAshby(targetCompanies: string[], searchTerms: string[]): Promise<any[]> {
  const verifiedAshbyCompanies = [
    'rippling', 'deel', 'loom', 'vercel', 'linear', 'ramp', 'mercury', 'brex', 
    'plaid', 'webflow', 'framer', 'retool', 'superhuman', 'notion', 'figma',
    'canva', 'doordash', 'robinhood', 'twitch', 'discord', 'shopify', 'github'
  ];

  const termsToSearch = searchTerms.slice(0, 3).map(t => t.toLowerCase());
  console.log(`🔵 Ashby: Searching for terms: ${termsToSearch.join(', ')}`);

  const fetchPromises = verifiedAshbyCompanies.map(async (company) => {
    try {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${company}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'jobswitchers/1.0' } });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const jobs = data.jobPostings || [];
        
        const matchedJobs = jobs.filter((job: any) => {
          const title = (job.title || '').toLowerCase();
          const description = (job.description || '').toLowerCase();
          return termsToSearch.some(term => {
            const termWords = term.split(/\s+/).filter(w => w.length > 3);
            return termWords.some(word => title.includes(word)) || title.includes(term) || description.includes(term);
          });
        });

        const finalJobs = matchedJobs.length > 0 ? matchedJobs : jobs.slice(0, 2);

        return finalJobs.map((job: any) => ({
          id: `ashby-${company}-${job.id}`,
          title: job.title || 'Unknown',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.locationName || 'Remote',
          url: job.applicationUrl || job.url || '#',
          description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 1000),
          postedDate: job.publishedDate || new Date().toISOString(),
          source: 'Ashby',
        }));
      }
    } catch (e) { /* skip */ }
    return [];
  });
  
  const results = await Promise.all(fetchPromises);
  const flatResults = results.flat();
  console.log(`🔵 Ashby: Found ${flatResults.length} jobs`);
  return flatResults;
}

// ==================== POST API ====================
export async function POST(req: NextRequest) {
  try {
    console.log("📄 Enhanced Deep CV Analysis with Contextual Matching & 4 Job Sources...");
    
    const formData = await req.formData();
    const file = formData.get('cv') as File;
    const userLocation = (formData.get('location') as string) || "";
    const userLat = formData.get('latitude') as string;
    const userLng = formData.get('longitude') as string;
    
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    let cvText = "";
    try { cvText = await readFileContent(file); } 
    catch (readError: any) {
      return NextResponse.json({ success: false, message: readError.message || "Could not read file content." }, { status: 400 });
    }
    
    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ success: false, message: "Could not read CV content." }, { status: 400 });
    }
    
    // ✅ UPDATED: Using Groq with qwen/qwen3.8-27b and max_tokens: 1000
    const aiAnalysis = await analyzeCVWithGroq(cvText, file.name);
    
    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    if (!APP_ID || !API_KEY) return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    
    // ==================== LOCATION LOGIC (ALL METRO CITIES + 70KM RADIUS) ====================
    let searchLocations: string[] = [];
    let userCoords: { lat: number; lon: number } | null = null;
    
    if (userLat && userLng && userLat !== "null" && userLng !== "null") {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLng);
      userCoords = { lat, lon };
      
      if (lat > 6 && lat < 38 && lon > 68 && lon < 98) {
        const nearby = await getNearbyCities(lat, lon, 70);
        searchLocations = nearby.length > 0 ? nearby : ["India"];
      } else {
        searchLocations = ["USA"];
      }
    } else if (userLocation && userLocation.trim() !== "" && userLocation.toLowerCase() !== "india") {
      searchLocations = [userLocation];
      const knownCity = MAJOR_CITIES.find(c => c.name.toLowerCase() === userLocation.toLowerCase());
      if (knownCity) {
        const nearby = await getNearbyCities(knownCity.lat, knownCity.lon, 70);
        searchLocations = [...new Set([userLocation, ...nearby])];
      }
    } else {
      searchLocations = ["India"];
    }
    
    console.log("📍 Search Locations:", searchLocations);
    
    let searchTerms = [...aiAnalysis.searchTerms];
    if (!searchTerms.some(t => t.toLowerCase().includes(aiAnalysis.primaryRole.toLowerCase()))) {
      searchTerms.unshift(aiAnalysis.primaryRole);
    }
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))].slice(0, 5);
    
    // ==================== FETCH FROM ALL 4 SOURCES IN PARALLEL ====================
    console.log("🚀 Fetching from 4 job sources...");
    const fetchPromises = [];
    
    // 1. Adzuna
    for (const location of searchLocations) {
      for (const term of searchTerms.slice(0, 3)) {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=25&what=${encodeURIComponent(term)}&where=${encodeURIComponent(location)}&max_days_old=30&content-type=application/json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        fetchPromises.push(
          fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'jobswitchers/1.0' } })
            .then(async (response) => {
              clearTimeout(timeoutId);
              if (response.ok) {
                const data = await response.json();
                return (data.results || []).map((job: any) => ({
                  ...job,
                  source: 'Adzuna',
                  company: job.company?.display_name || 'Unknown',
                  location: job.location?.display_name || 'Unknown',
                  url: job.redirect_url || '#',
                  description: job.description || '',
                  postedDate: job.created || new Date().toISOString(),
                }));
              }
              return [];
            })
            .catch(err => {
              clearTimeout(timeoutId);
              console.error(`Error fetching ${term} in ${location}:`, err.message);
              return [];
            })
        );
      }
    }
    
    // 2. Greenhouse, 3. Lever, 4. Ashby
    fetchPromises.push(fetchFromGreenhouse(aiAnalysis.targetCompanies, searchTerms));
    fetchPromises.push(fetchFromLever(aiAnalysis.targetCompanies, searchTerms));
    fetchPromises.push(fetchFromAshby(aiAnalysis.targetCompanies, searchTerms));
    
    const resultsArrays = await Promise.all(fetchPromises);
    const allRawJobs = resultsArrays.flat();
    console.log(`📊 Total raw jobs fetched: ${allRawJobs.length}`);
    
    // ==================== PROCESS & CONTEXTUAL SCORE JOBS ====================
    const processedJobs = allRawJobs.map(job => {
      let jobCity = "";
      let distance: number | null = null;
      let isWithinRadius = true;
      
      if (job.location) {
        const parts = (typeof job.location === 'string' ? job.location : (job.location as any).name || '').split(',');
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
      
      const matchPercentage = calculateMatchPercentage(job.title || '', job.description || '', aiAnalysis);
      
      return {
        id: job.id || `${job.source}-${Math.random().toString(36).substr(2, 9)}`,
        title: job.title || "Unknown",
        company: job.company || "Unknown",
        location: job.location || "Unknown",
        city: jobCity,
        description: (job.description || "").replace(/<[^>]*>/g, '').substring(0, 500),
        url: job.url || "#",
        postedDate: new Date(job.postedDate || Date.now()),
        matchPercentage: matchPercentage,
        matchingSkills: aiAnalysis.keySkills.filter((skill: string) => 
          (job.title + ' ' + job.description).toLowerCase().includes(skill.toLowerCase())
        ).slice(0, 5),
        primaryRole: aiAnalysis.primaryRole,
        distance: distance,
        withinRadius: isWithinRadius,
        source: job.source || 'Unknown',
      };
    });
    
    // ==================== STRICT FILTERING: 50%+ MATCH ONLY ====================
    const seenUrls = new Set<string>();
    const now = new Date();
    
    const filteredJobs = processedJobs
      .filter(job => {
        if (seenUrls.has(job.url)) return false;
        seenUrls.add(job.url);
        
        const diffDays = (now.getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
        
        if (job.matchPercentage < 50) return false;
        
        if (userCoords && job.distance !== null && !job.withinRadius) return false;
        
        return true;
      })
      .sort((a, b) => {
        if (a.withinRadius && !b.withinRadius) return -1;
        if (!a.withinRadius && b.withinRadius) return 1;
        return b.matchPercentage - a.matchPercentage;
      })
      .slice(0, 50);
    
    const withinRadiusCount = filteredJobs.filter(j => j.withinRadius).length;
    
    const sourceBreakdown = {
      adzuna: filteredJobs.filter(j => j.source === 'Adzuna').length,
      greenhouse: filteredJobs.filter(j => j.source === 'Greenhouse').length,
      lever: filteredJobs.filter(j => j.source === 'Lever').length,
      ashby: filteredJobs.filter(j => j.source === 'Ashby').length,
    };
    
    console.log(`✅ Final: ${filteredJobs.length} highly relevant jobs (50%+ match)`);
    console.log(`📍 Within 70km: ${withinRadiusCount}`);
    console.log(`📊 Sources: Adzuna=${sourceBreakdown.adzuna}, Greenhouse=${sourceBreakdown.greenhouse}, Lever=${sourceBreakdown.lever}, Ashby=${sourceBreakdown.ashby}`);
    
    return NextResponse.json({
      success: true,
      isTechCV: true,
      candidateFirstName: aiAnalysis.candidateFirstName,
      candidateFullName: aiAnalysis.candidateFullName,
      primaryRole: aiAnalysis.primaryRole,
      secondaryRoles: aiAnalysis.secondaryRoles,
      keySkills: aiAnalysis.keySkills,
      toolsAndFrameworks: aiAnalysis.toolsAndFrameworks,
      coreResponsibilities: aiAnalysis.coreResponsibilities,
      experienceYears: aiAnalysis.experienceYears,
      seniorityLevel: aiAnalysis.seniorityLevel,
      domainExpertise: aiAnalysis.domainExpertise,
      companyPedigree: aiAnalysis.companyPedigree,
      certifications: aiAnalysis.certifications,
      educationLevel: aiAnalysis.educationLevel,
      industry: aiAnalysis.industry,
      summary: aiAnalysis.summary,
      idealJobProfile: aiAnalysis.idealJobProfile,
      searchTermsUsed: searchTerms,
      matchedJobs: filteredJobs,
      totalMatches: filteredJobs.length,
      withinRadiusCount,
      sourceBreakdown: sourceBreakdown,
      source: 'Groq AI (qwen/qwen3.8-27b) + 4 Job Sources',
      location: searchLocations.join(', '),
      salaryEstimate: aiAnalysis.salaryEstimate,
      negotiationTip: aiAnalysis.negotiationTip,
      message: filteredJobs.length > 0 
        ? `✅ Found ${filteredJobs.length} highly relevant jobs (50%+ match) from 4 sources. ${withinRadiusCount} within 70km radius.`
        : `⚠️ No jobs with 50%+ match found. Try different search terms or location.`
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Failed to process CV', details: String(error) }, { status: 500 });
  }
}