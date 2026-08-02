import { NextRequest, NextResponse } from 'next/server';

// ==================== COMPLETE DOMAIN DATABASE ====================
const domainDatabase = {
  'finance/payroll': {
    keywords: [
      'payroll', 'tax', 'w-2', 'w2', '1099', '1099-r', '1042-s', '941', '940',
      'fica', 'flsa', 'suta', 'sui', 'futa', 'state tax', 'federal tax', 'local tax',
      'finance', 'accounting', 'audit', 'reconciliation', 'compliance',
      'benefits', 'retirement', 'pension', 'defined benefit', 'defined contribution',
      'payroll processing', 'payroll administration', 'tax compliance',
      'financial reporting', 'general ledger', 'accounts payable', 'accounts receivable',
      'bookkeeping', 'financial analysis', 'budgeting', 'forecasting',
      'us payroll', 'international payroll', 'payroll specialist', 'tax analyst'
    ],
    jobTitles: ['Payroll Specialist', 'Tax Analyst', 'Benefits Analyst', 'Finance Manager', 'Accountant', 'Auditor', 'Compliance Officer', 'Financial Analyst'],
    skills: ['Payroll Processing', 'Tax Compliance', 'Financial Reporting', 'W-2/1099', 'FICA/SUTA/FUTA', 'Audit', 'Reconciliation'],
    searchTerms: ['payroll', 'tax', 'finance', 'accounting', 'compliance']
  },
  'technology': {
    keywords: [
      'react', 'angular', 'vue', 'next.js', 'node.js', 'python', 'java',
      'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql',
      'mongodb', 'devops', 'cloud', 'api', 'microservices', 'full stack',
      'frontend', 'backend', 'machine learning', 'data science', 'blockchain',
      'software developer', 'software engineer', 'programming', 'coding'
    ],
    jobTitles: ['Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Data Engineer', 'Machine Learning Engineer'],
    skills: ['React', 'Python', 'JavaScript', 'AWS', 'Docker', 'SQL', 'DevOps', 'Cloud Computing'],
    searchTerms: ['developer', 'engineer', 'software', 'programming']
  },
  'sales': {
    keywords: ['sales', 'business development', 'lead generation', 'account management', 'negotiation', 'crm', 'cold calling', 'closing', 'quota', 'revenue', 'b2b', 'enterprise sales'],
    jobTitles: ['Sales Manager', 'Business Development Manager', 'Account Executive', 'Sales Representative'],
    skills: ['Sales', 'Business Development', 'Lead Generation', 'Negotiation', 'CRM', 'Account Management'],
    searchTerms: ['sales', 'business development', 'account manager']
  },
  'hr': {
    keywords: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations', 'performance management', 'training', 'compensation', 'benefits'],
    jobTitles: ['HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner'],
    skills: ['HR Management', 'Recruitment', 'Talent Acquisition', 'Employee Relations', 'Performance Management'],
    searchTerms: ['hr', 'human resources', 'recruitment']
  },
  'design': {
    keywords: ['ui', 'ux', 'figma', 'photoshop', 'illustrator', 'indesign', 'graphic design', 'visual design', 'prototyping', 'wireframing', 'branding', 'typography'],
    jobTitles: ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Visual Designer'],
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Visual Design'],
    searchTerms: ['design', 'ui/ux', 'graphic', 'creative']
  },
  'marketing': {
    keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand', 'campaign', 'analytics', 'google analytics', 'advertising', 'email marketing', 'ppc'],
    jobTitles: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist', 'SEO Specialist', 'Social Media Manager'],
    skills: ['Marketing', 'Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Brand Management'],
    searchTerms: ['marketing', 'digital marketing', 'seo', 'content']
  },
  'operations': {
    keywords: ['operations', 'supply chain', 'logistics', 'inventory', 'warehouse', 'distribution', 'procurement', 'vendor management', 'quality', 'process improvement', 'lean', 'six sigma'],
    jobTitles: ['Operations Manager', 'Supply Chain Manager', 'Logistics Manager', 'Procurement Specialist'],
    skills: ['Operations', 'Supply Chain', 'Logistics', 'Inventory Management', 'Procurement', 'Vendor Management'],
    searchTerms: ['operations', 'supply chain', 'logistics', 'procurement']
  },
  'call centre': {
    keywords: ['call centre', 'call center', 'customer support', 'customer service', 'bpo', 'voice process', 'inbound', 'outbound', 'customer care', 'telecalling', 'query resolution'],
    jobTitles: ['Customer Service Representative', 'Customer Support Executive', 'Call Centre Agent', 'Team Leader'],
    skills: ['Customer Service', 'Call Centre Operations', 'Inbound/Outbound', 'Query Resolution'],
    searchTerms: ['customer service', 'call centre', 'bpo', 'support']
  },
  'healthcare': {
    keywords: ['healthcare', 'medical', 'clinical', 'nursing', 'patient', 'doctor', 'hospital', 'pharmacy', 'medical records', 'health informatics', 'biotech', 'pharmaceutical'],
    jobTitles: ['Healthcare Administrator', 'Nurse', 'Medical Officer', 'Healthcare Consultant'],
    skills: ['Healthcare', 'Patient Care', 'Clinical Operations', 'Medical Records', 'Healthcare Administration'],
    searchTerms: ['healthcare', 'medical', 'clinical', 'nursing']
  },
  'legal': {
    keywords: ['legal', 'law', 'attorney', 'compliance', 'regulatory', 'contract', 'litigation', 'corporate law', 'legal advisory', 'legal research'],
    jobTitles: ['Legal Counsel', 'Compliance Officer', 'Corporate Lawyer', 'Legal Analyst'],
    skills: ['Legal', 'Compliance', 'Corporate Law', 'Contract Management', 'Legal Research'],
    searchTerms: ['legal', 'law', 'compliance', 'regulatory']
  },
  'education': {
    keywords: ['education', 'teaching', 'training', 'curriculum', 'pedagogy', 'student', 'learning', 'faculty', 'academic', 'professor', 'teacher', 'coaching', 'mentoring', 'e-learning'],
    jobTitles: ['Teacher', 'Professor', 'Trainer', 'Instructional Designer', 'Curriculum Developer'],
    skills: ['Teaching', 'Curriculum Development', 'Training', 'Instructional Design', 'Learning Management'],
    searchTerms: ['education', 'teaching', 'training', 'academic']
  },
  'engineering': {
    keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'aerospace', 'automotive', 'industrial', 'manufacturing', 'cad', 'solidworks', 'autocad', 'matlab'],
    jobTitles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Structural Engineer'],
    skills: ['Engineering', 'Mechanical Design', 'CAD/CAM', 'Project Management', 'Manufacturing', 'Quality Assurance'],
    searchTerms: ['engineering', 'mechanical', 'electrical', 'civil']
  }
};

// ==================== DETECT DOMAIN WITH SCORING ====================
function detectDomain(text: string): { domain: string; confidence: number; keywords: string[] } {
  const lowerText = text.toLowerCase();
  let bestDomain = 'finance/payroll';
  let bestScore = 0;
  let matchedKeywords: string[] = [];

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

  return {
    domain: bestDomain,
    confidence: Math.min(bestScore / 10, 1),
    keywords: matchedKeywords.slice(0, 10)
  };
}

// ==================== EXTRACT SKILLS FROM DOMAIN ====================
function extractSkillsFromDomain(domain: string, text: string): {
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
} {
  const domainData = domainDatabase[domain as keyof typeof domainDatabase];
  const lowerText = text.toLowerCase();
  const extractedSkills: string[] = [];
  const extractedJobRoles: string[] = [];

  // Add domain skills
  if (domainData) {
    for (const skill of domainData.skills) {
      extractedSkills.push(skill);
    }
    for (const title of domainData.jobTitles) {
      extractedJobRoles.push(title);
    }
  }

  // Extract location
  let location = "India";
  const locationKeywords = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'noida', 'gurgaon', 'ahmedabad'];
  for (const loc of locationKeywords) {
    if (lowerText.includes(loc)) {
      location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // Extract experience
  let experience = "3-5 years";
  const expMatch = text.match(/(\d+)\s*(?:years?|yrs?)/i);
  if (expMatch) {
    experience = expMatch[0];
  }

  return {
    skills: extractedSkills,
    jobRoles: extractedJobRoles.slice(0, 3),
    experience: experience,
    location: location,
    industry: domain.charAt(0).toUpperCase() + domain.slice(1).replace('/', ' / ')
  };
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
    
    // Detect domain
    const domainDetection = detectDomain(cvText);
    console.log("🎯 Detected Domain:", domainDetection.domain, "Confidence:", domainDetection.confidence);
    console.log("📌 Keywords:", domainDetection.keywords.slice(0, 5));
    
    // Extract skills
    const extractionResult = extractSkillsFromDomain(domainDetection.domain, cvText);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    const detectedIndustry = extractionResult.industry;
    
    console.log("🎯 Skills:", extractedSkills.slice(0, 5));
    console.log("💼 Job Roles:", detectedJobRoles);
    console.log("🏢 Industry:", detectedIndustry);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // Build search queries
    let searchTerms: string[] = [];
    
    const industryTerms: { [key: string]: string[] } = {
      'finance/payroll': ['payroll', 'tax', 'finance', 'accounting', 'compliance'],
      'technology': ['developer', 'engineer', 'software', 'programming'],
      'sales': ['sales', 'business development', 'account manager'],
      'hr': ['hr', 'human resources', 'recruitment'],
      'design': ['design', 'ui/ux', 'graphic design'],
      'marketing': ['marketing', 'digital marketing', 'seo'],
      'operations': ['operations', 'supply chain', 'logistics'],
      'call centre': ['customer service', 'call centre', 'bpo'],
      'healthcare': ['healthcare', 'medical', 'clinical'],
      'legal': ['legal', 'law', 'compliance'],
      'education': ['education', 'teaching', 'training'],
      'engineering': ['engineering', 'mechanical', 'electrical']
    };

    const industrySearchTerms = industryTerms[domainDetection.domain] || ['payroll', 'tax', 'finance'];
    searchTerms.push(...industrySearchTerms);
    
    if (detectedJobRoles.length > 0) {
      searchTerms.push(...detectedJobRoles.slice(0, 2));
    }
    
    if (extractedSkills.length > 0) {
      searchTerms.push(...extractedSkills.slice(0, 2));
    }
    
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    if (searchTerms.length === 0) {
      searchTerms = ['jobs'];
    }
    
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
      source: 'Direct Keyword Detection (No AI)'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}