import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== COMPLETE DOMAIN DATABASE WITH KEYWORDS ====================
const domainDatabase = {
  'finance/payroll': {
    keywords: [
      'payroll', 'tax', 'w-2', 'w2', '1099', '1099-r', '1042-s', '941', '940',
      'fica', 'flsa', 'sita', 'sui', 'suta', 'futa', 'local tax', 'state tax',
      'compliance', 'finance', 'accounting', 'benefits', 'retirement', 'pension',
      'defined benefit', 'audit', 'reconciliation', 'tax analyst', 'payroll specialist',
      'benefits analyst', 'tax compliance', 'payroll processing', 'financial reporting'
    ],
    jobTitles: ['Payroll Specialist', 'Tax Analyst', 'Benefits Analyst', 'Finance Manager', 'Accountant', 'Auditor', 'Compliance Officer'],
    skills: ['Payroll Processing', 'Tax Compliance', 'Financial Reporting', 'W-2/1099', 'FICA/SUTA/FUTA', 'Audit', 'Reconciliation'],
    searchTerms: ['payroll', 'tax', 'finance', 'accounting', 'compliance']
  },
  'technology': {
    keywords: [
      'react', 'angular', 'vue', 'next.js', 'node.js', 'python', 'java',
      'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql',
      'mongodb', 'devops', 'cloud', 'api', 'microservices', 'frontend', 'backend',
      'full stack', 'machine learning', 'data science', 'blockchain', 'web3'
    ],
    jobTitles: ['Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Data Engineer'],
    skills: ['React', 'Python', 'JavaScript', 'AWS', 'Docker', 'SQL', 'DevOps', 'Cloud Computing'],
    searchTerms: ['developer', 'engineer', 'software', 'programming', 'tech']
  },
  'sales': {
    keywords: ['sales', 'business development', 'lead generation', 'account management', 'negotiation', 'crm', 'cold calling', 'closing', 'quota', 'revenue', 'b2b', 'enterprise sales'],
    jobTitles: ['Sales Manager', 'Business Development Manager', 'Account Executive', 'Sales Representative'],
    skills: ['Sales', 'Business Development', 'Lead Generation', 'Negotiation', 'CRM', 'Account Management'],
    searchTerms: ['sales', 'business development', 'account manager']
  },
  'hr': {
    keywords: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations', 'performance management', 'training', 'compensation', 'benefits', 'workforce planning'],
    jobTitles: ['HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner'],
    skills: ['HR Management', 'Recruitment', 'Talent Acquisition', 'Employee Relations', 'Performance Management'],
    searchTerms: ['hr', 'human resources', 'recruitment', 'talent acquisition']
  },
  'design': {
    keywords: ['ui', 'ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign', 'prototyping', 'wireframing', 'visual design', 'branding', 'typography', 'motion graphics'],
    jobTitles: ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Visual Designer', 'Creative Director'],
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'Wireframing', 'Visual Design'],
    searchTerms: ['design', 'ui/ux', 'graphic', 'creative', 'visual']
  },
  'marketing': {
    keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand', 'campaign', 'analytics', 'google analytics', 'advertising', 'email marketing', 'ppc', 'growth'],
    jobTitles: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist', 'SEO Specialist', 'Social Media Manager'],
    skills: ['Marketing', 'Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Brand Management', 'Analytics'],
    searchTerms: ['marketing', 'digital marketing', 'seo', 'content']
  },
  'operations': {
    keywords: ['operations', 'supply chain', 'logistics', 'inventory', 'warehouse', 'distribution', 'procurement', 'vendor management', 'quality', 'process improvement', 'lean', 'six sigma'],
    jobTitles: ['Operations Manager', 'Supply Chain Manager', 'Logistics Manager', 'Procurement Specialist', 'Inventory Manager'],
    skills: ['Operations', 'Supply Chain', 'Logistics', 'Inventory Management', 'Procurement', 'Vendor Management'],
    searchTerms: ['operations', 'supply chain', 'logistics', 'procurement']
  },
  'call centre': {
    keywords: ['call centre', 'call center', 'customer support', 'customer service', 'bpo', 'voice process', 'inbound', 'outbound', 'customer care', 'telecalling', 'query resolution'],
    jobTitles: ['Customer Service Representative', 'Customer Support Executive', 'Call Centre Agent', 'Team Leader', 'Quality Analyst'],
    skills: ['Customer Service', 'Call Centre Operations', 'Inbound/Outbound', 'Query Resolution', 'CRM Tools'],
    searchTerms: ['customer service', 'call centre', 'bpo', 'support', 'customer care']
  },
  'healthcare': {
    keywords: ['healthcare', 'medical', 'clinical', 'nursing', 'patient', 'doctor', 'hospital', 'pharmacy', 'medical records', 'health informatics', 'biotech', 'pharmaceutical', 'clinical trials'],
    jobTitles: ['Healthcare Administrator', 'Clinical Manager', 'Nurse', 'Medical Officer', 'Healthcare Consultant', 'Pharma Manager'],
    skills: ['Healthcare', 'Patient Care', 'Clinical Operations', 'Medical Records', 'Healthcare Administration', 'Pharmaceuticals'],
    searchTerms: ['healthcare', 'medical', 'clinical', 'nursing', 'pharma']
  },
  'legal': {
    keywords: ['legal', 'law', 'attorney', 'advocate', 'compliance', 'regulatory', 'contract', 'litigation', 'corporate law', 'legal advisory', 'legal research', 'drafting', 'negotiation'],
    jobTitles: ['Legal Counsel', 'Compliance Officer', 'Corporate Lawyer', 'Legal Manager', 'Legal Analyst'],
    skills: ['Legal', 'Compliance', 'Corporate Law', 'Contract Management', 'Legal Research', 'Regulatory Compliance'],
    searchTerms: ['legal', 'law', 'compliance', 'regulatory']
  },
  'education': {
    keywords: ['education', 'teaching', 'training', 'curriculum', 'pedagogy', 'student', 'learning', 'faculty', 'academic', 'professor', 'teacher', 'coaching', 'mentoring', 'e-learning'],
    jobTitles: ['Teacher', 'Professor', 'Trainer', 'Instructional Designer', 'Curriculum Developer', 'Education Manager'],
    skills: ['Education', 'Teaching', 'Curriculum Development', 'Training', 'Instructional Design', 'Learning Management'],
    searchTerms: ['education', 'teaching', 'training', 'academic']
  },
  'engineering': {
    keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'aerospace', 'automotive', 'industrial', 'manufacturing', 'cad', 'solidworks', 'autocad', 'matlab'],
    jobTitles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Structural Engineer', 'Industrial Engineer'],
    skills: ['Engineering', 'Mechanical Design', 'CAD/CAM', 'Project Management', 'Manufacturing', 'Quality Assurance'],
    searchTerms: ['engineering', 'mechanical', 'electrical', 'civil', 'manufacturing']
  },
  'consulting': {
    keywords: ['consulting', 'strategy', 'management consulting', 'business analysis', 'solution design', 'client engagement', 'advisory', 'transformation', 'process optimization', 'change management'],
    jobTitles: ['Management Consultant', 'Strategy Consultant', 'Business Analyst', 'Advisory Manager', 'Transformation Lead'],
    skills: ['Consulting', 'Strategy', 'Business Analysis', 'Client Management', 'Change Management', 'Process Optimization'],
    searchTerms: ['consulting', 'strategy', 'business analysis', 'advisory']
  },
  'data analytics': {
    keywords: ['data', 'analytics', 'data analysis', 'data science', 'data engineering', 'business intelligence', 'power bi', 'tableau', 'sql', 'python', 'statistics', 'predictive modeling', 'etl', 'data warehousing'],
    jobTitles: ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Data Engineer', 'BI Developer'],
    skills: ['Data Analysis', 'Data Science', 'Data Engineering', 'Business Intelligence', 'Power BI', 'Tableau', 'SQL', 'Python'],
    searchTerms: ['data', 'analytics', 'data science', 'business intelligence']
  }
};

// ==================== DETECT DOMAIN WITH SCORING ====================
function detectDomain(text: string): { domain: string; confidence: number; keywords: string[] } {
  const lowerText = text.toLowerCase();
  let bestDomain = 'technology'; // Default
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  // Check all domains
  for (const [domain, data] of Object.entries(domainDatabase)) {
    let score = 0;
    const matched: string[] = [];
    
    // Check keywords
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword)) {
        score += 3;
        matched.push(keyword);
      }
    }
    
    // Check job titles
    for (const title of data.jobTitles) {
      if (lowerText.includes(title.toLowerCase())) {
        score += 5;
        matched.push(title);
      }
    }
    
    // Check skills
    for (const skill of data.skills) {
      if (lowerText.includes(skill.toLowerCase())) {
        score += 2;
        matched.push(skill);
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
      matchedKeywords = matched;
    }
  }

  // If score is very low, use default
  if (bestScore < 5) {
    // Check for any domain keywords
    for (const [domain, data] of Object.entries(domainDatabase)) {
      for (const keyword of data.keywords) {
        if (lowerText.includes(keyword)) {
          return {
            domain: domain,
            confidence: 0.3,
            keywords: [keyword]
          };
        }
      }
    }
  }

  return {
    domain: bestDomain,
    confidence: Math.min(bestScore / 20, 1),
    keywords: matchedKeywords.slice(0, 10)
  };
}

// ==================== EXTRACT SKILLS ====================
async function extractSkillsWithAI(text: string, domain: string): Promise<{
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      You are a professional resume parser. Extract structured information from this resume.

      CRITICAL RULES:
      1. Extract ONLY skills explicitly mentioned in the resume.
      2. Extract EXACT job titles from professional experience.
      3. Determine the industry based on the resume content.
      4. Return ONLY valid JSON (no markdown, no explanation).

      Format:
      {
        "skills": ["skill1", "skill2", "skill3"],
        "jobRoles": ["exact job title 1", "exact job title 2"],
        "experience": "X years",
        "location": "city, country",
        "industry": "Finance/Payroll or Technology or Sales or HR or Design or Marketing or Operations or Call Centre or Healthcare or Legal or Education or Engineering or Consulting or Data Analytics"
      }

      Resume text:
      ${text.substring(0, 6000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    const cleanJson = text_response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    let industry = parsed.industry || domain;
    
    // Map industry to valid values
    const industryMap: { [key: string]: string } = {
      'payroll': 'Finance/Payroll',
      'finance': 'Finance/Payroll',
      'tax': 'Finance/Payroll',
      'accounting': 'Finance/Payroll',
      'technology': 'Technology',
      'tech': 'Technology',
      'sales': 'Sales',
      'hr': 'HR',
      'human resources': 'HR',
      'design': 'Design',
      'marketing': 'Marketing',
      'operations': 'Operations',
      'call centre': 'Call Centre',
      'healthcare': 'Healthcare',
      'medical': 'Healthcare',
      'legal': 'Legal',
      'law': 'Legal',
      'education': 'Education',
      'teaching': 'Education',
      'engineering': 'Engineering',
      'consulting': 'Consulting',
      'data': 'Data Analytics',
      'analytics': 'Data Analytics'
    };
    
    const lowerIndustry = industry.toLowerCase();
    for (const [key, value] of Object.entries(industryMap)) {
      if (lowerIndustry.includes(key)) {
        industry = value;
        break;
      }
    }
    
    return {
      skills: parsed.skills || [],
      jobRoles: parsed.jobRoles || [],
      experience: parsed.experience || "3-5 years",
      location: parsed.location || "India",
      industry: industry
    };
  } catch (error) {
    console.error("❌ AI Error:", error);
    const domainData = domainDatabase[domain as keyof typeof domainDatabase];
    return {
      skills: domainData?.skills || ['Professional', 'Management'],
      jobRoles: domainData?.jobTitles?.slice(0, 3) || ['Professional'],
      experience: "3-5 years",
      location: "India",
      industry: domain
    };
  }
}

// ==================== CALCULATE MATCH PERCENTAGE ====================
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

// ==================== POST API ====================
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
    
    // ==================== STEP 1: DETECT DOMAIN ====================
    const domainDetection = detectDomain(cvText);
    console.log("🎯 Detected Domain:", domainDetection.domain, "Confidence:", domainDetection.confidence);
    console.log("📌 Keywords:", domainDetection.keywords);
    
    // ==================== STEP 2: EXTRACT SKILLS ====================
    const extractionResult = await extractSkillsWithAI(cvText, domainDetection.domain);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    const detectedIndustry = extractionResult.industry;
    
    console.log("🎯 Skills:", extractedSkills);
    console.log("💼 Job Roles:", detectedJobRoles);
    console.log("🏢 Industry:", detectedIndustry);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== STEP 3: BUILD SEARCH QUERIES ====================
    let searchTerms: string[] = [];
    
    // Industry-based terms
    const industryTerms: { [key: string]: string[] } = {
      'Finance/Payroll': ['payroll', 'tax', 'finance', 'accounting', 'compliance'],
      'Technology': ['developer', 'engineer', 'software', 'programming'],
      'Sales': ['sales', 'business development', 'account manager'],
      'HR': ['hr', 'human resources', 'recruitment'],
      'Design': ['design', 'ui/ux', 'graphic design'],
      'Marketing': ['marketing', 'digital marketing', 'seo'],
      'Operations': ['operations', 'supply chain', 'logistics'],
      'Call Centre': ['customer service', 'call centre', 'bpo'],
      'Healthcare': ['healthcare', 'medical', 'clinical'],
      'Legal': ['legal', 'law', 'compliance'],
      'Education': ['education', 'teaching', 'training'],
      'Engineering': ['engineering', 'mechanical', 'electrical'],
      'Consulting': ['consulting', 'strategy', 'advisory'],
      'Data Analytics': ['data', 'analytics', 'data science']
    };

    // Get industry-specific search terms
    const industrySearchTerms = industryTerms[detectedIndustry] || ['jobs'];
    searchTerms.push(...industrySearchTerms);
    
    // Add job roles
    if (detectedJobRoles.length > 0) {
      searchTerms.push(...detectedJobRoles.slice(0, 2));
    }
    
    // Add skills
    if (extractedSkills.length > 0) {
      searchTerms.push(...extractedSkills.slice(0, 2));
    }
    
    // Remove duplicates and empty
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    console.log("🔍 Search Terms:", searchTerms);
    
    if (searchTerms.length === 0) {
      searchTerms = ['jobs'];
    }
    
    // ==================== STEP 4: FETCH JOBS ====================
    let allJobs: any[] = [];
    
    for (const term of searchTerms.slice(0, 5)) {
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
                matchPercentage: calculateMatchPercentage(job.title || '', job.description || '', extractedSkills),
                matchingSkills: extractedSkills.filter(skill => 
                  (job.title + ' ' + (job.description || '')).toLowerCase().includes(skill.toLowerCase())
                ).slice(0, 5),
                industry: detectedIndustry
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
    
    // ==================== STEP 5: DEDUPLICATE AND SORT ====================
    const seenUrls = new Set();
    const uniqueJobs = allJobs.filter(job => {
      if (seenUrls.has(job.url)) return false;
      seenUrls.add(job.url);
      return true;
    });
    
    uniqueJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const finalJobs = uniqueJobs.slice(0, 50);
    
    console.log("✅ Jobs found:", finalJobs.length);
    console.log("📊 Industry used:", detectedIndustry);
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      jobRoles: detectedJobRoles,
      detectedDomain: domainDetection.domain,
      detectedIndustry: detectedIndustry,
      domainConfidence: domainDetection.confidence,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'Domain Detection + Industry-Based Search'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}