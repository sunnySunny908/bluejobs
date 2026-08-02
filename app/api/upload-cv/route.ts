import { NextRequest, NextResponse } from 'next/server';

// ==================== EXPERIENCE-BASED JOB DETECTION ====================
function extractJobRolesFromExperience(text: string): {
  primaryRole: string;
  allRoles: string[];
  industry: string;
  confidence: number;
} {
  const lowerText = text.toLowerCase();
  
  // ==================== STEP 1: FIND EXPERIENCE SECTION ====================
  const lines = text.split('\n');
  let experienceSection = '';
  let inExperience = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('experience') || lowerLine.includes('professional experience') || lowerLine.includes('work experience')) {
      inExperience = true;
      continue;
    }
    if (inExperience) {
      if (lowerLine.includes('education') || lowerLine.includes('skills') || lowerLine.includes('summary')) {
        break;
      }
      experienceSection += line + ' ';
    }
  }
  
  // If no experience section found, use entire text
  if (!experienceSection.trim()) {
    experienceSection = text;
  }
  
  console.log("📋 Experience Section Length:", experienceSection.length);
  
  // ==================== STEP 2: DETECT JOB ROLES FROM EXPERIENCE ====================
  const jobRolePatterns = [
    // Finance/Payroll
    { keywords: ['payroll', 'tax', 'finance', 'accounting', 'audit', 'compliance', 'benefits', 'retirement', 'pension'], role: 'Payroll/Tax Specialist', industry: 'Finance/Payroll' },
    
    // Technology
    { keywords: ['developer', 'engineer', 'software', 'programming', 'react', 'python', 'java', 'javascript', 'aws', 'docker', 'kubernetes', 'sql', 'devops', 'cloud', 'api', 'microservices', 'full stack', 'frontend', 'backend', 'machine learning', 'data science', 'blockchain'], role: 'Software Developer', industry: 'Technology' },
    
    // Sales
    { keywords: ['sales', 'business development', 'lead generation', 'account management', 'negotiation', 'crm', 'cold calling', 'closing', 'quota', 'revenue', 'b2b', 'enterprise sales'], role: 'Sales Manager', industry: 'Sales' },
    
    // HR
    { keywords: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations', 'performance management', 'training', 'compensation', 'benefits'], role: 'HR Manager', industry: 'HR' },
    
    // Design
    { keywords: ['ui', 'ux', 'graphic design', 'figma', 'photoshop', 'illustrator', 'indesign', 'visual design', 'prototyping', 'wireframing', 'branding', 'typography', 'motion graphics'], role: 'UI/UX Designer', industry: 'Design' },
    
    // Marketing
    { keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand', 'campaign', 'analytics', 'google analytics', 'advertising', 'email marketing', 'ppc', 'growth', 'market research', 'positioning'], role: 'Marketing Manager', industry: 'Marketing' },
    
    // Operations
    { keywords: ['operations', 'supply chain', 'logistics', 'inventory', 'warehouse', 'distribution', 'procurement', 'vendor management', 'quality', 'process improvement', 'lean', 'six sigma'], role: 'Operations Manager', industry: 'Operations' },
    
    // Call Centre
    { keywords: ['call centre', 'call center', 'customer support', 'customer service', 'bpo', 'voice process', 'non-voice process', 'inbound', 'outbound', 'customer care', 'telecalling', 'query resolution'], role: 'Customer Service Manager', industry: 'Call Centre' },
    
    // Healthcare
    { keywords: ['healthcare', 'medical', 'clinical', 'nursing', 'patient', 'doctor', 'hospital', 'pharmacy', 'medical records', 'health informatics', 'biotech', 'pharmaceutical', 'clinical trials'], role: 'Healthcare Professional', industry: 'Healthcare' },
    
    // Legal
    { keywords: ['legal', 'law', 'attorney', 'advocate', 'compliance', 'regulatory', 'contract', 'litigation', 'corporate law', 'legal advisory', 'legal research', 'drafting'], role: 'Legal Professional', industry: 'Legal' },
    
    // Education
    { keywords: ['education', 'teaching', 'training', 'curriculum', 'pedagogy', 'student', 'learning', 'faculty', 'academic', 'professor', 'teacher', 'coaching', 'mentoring', 'e-learning'], role: 'Teacher/Trainer', industry: 'Education' },
    
    // Engineering
    { keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'aerospace', 'automotive', 'industrial', 'manufacturing', 'cad', 'solidworks', 'autocad', 'matlab'], role: 'Engineer', industry: 'Engineering' },
    
    // Consulting
    { keywords: ['consulting', 'strategy', 'management consulting', 'business analysis', 'solution design', 'client engagement', 'advisory', 'transformation', 'process optimization', 'change management', 'due diligence'], role: 'Consultant', industry: 'Consulting' },
    
    // Data Analytics
    { keywords: ['data', 'analytics', 'data analysis', 'data science', 'data engineering', 'business intelligence', 'power bi', 'tableau', 'sql', 'statistics', 'predictive modeling', 'data visualization', 'etl', 'data warehousing'], role: 'Data Analyst', industry: 'Data Analytics' },
    
    // Project Management
    { keywords: ['project management', 'project planning', 'project coordination', 'scrum master', 'product owner', 'project manager', 'program manager', 'pmp', 'agile', 'waterfall', 'kanban', 'jira'], role: 'Project Manager', industry: 'Project Management' },
    
    // Manufacturing
    { keywords: ['manufacturing', 'production', 'factory', 'plant', 'assembly', 'lean manufacturing', 'six sigma', 'kaizen', '5s', 'quality control', 'quality assurance', 'production planning'], role: 'Manufacturing Engineer', industry: 'Manufacturing' },
    
    // Hospitality
    { keywords: ['hospitality', 'hotel', 'resort', 'restaurant', 'catering', 'food and beverage', 'guest services', 'front office', 'housekeeping', 'event management', 'banquets', 'tourism', 'travel'], role: 'Hospitality Manager', industry: 'Hospitality' },
    
    // Retail
    { keywords: ['retail', 'fmcg', 'consumer goods', 'supermarket', 'department store', 'merchandising', 'visual merchandising', 'store operations', 'category management', 'buying', 'sourcing'], role: 'Retail Manager', industry: 'Retail' },
    
    // Media
    { keywords: ['media', 'entertainment', 'broadcast', 'television', 'radio', 'podcast', 'film', 'movie', 'cinema', 'production', 'editing', 'video editing', 'audio editing', 'sound design', 'animation', 'motion graphics', 'vfx', 'journalism', 'news', 'reporting'], role: 'Media Professional', industry: 'Media' },
    
    // Construction
    { keywords: ['construction', 'building', 'architecture', 'civil engineering', 'structural', 'infrastructure', 'site management', 'construction management', 'quantity surveying', 'cost estimation', 'budgeting', 'contracts'], role: 'Construction Manager', industry: 'Construction' },
    
    // Logistics
    { keywords: ['logistics', 'transportation', 'freight', 'shipping', 'cargo', 'container', 'supply chain', 'warehouse', 'distribution', 'fleet management', 'route planning', 'transport management', 'delivery', 'last mile'], role: 'Logistics Manager', industry: 'Logistics' }
  ];
  
  // ==================== STEP 3: SCORE EACH ROLE ====================
  let bestRole = { role: 'Payroll/Tax Specialist', industry: 'Finance/Payroll', score: 0 };
  
  for (const pattern of jobRolePatterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (experienceSection.toLowerCase().includes(keyword)) {
        score += 2;
      }
      if (text.toLowerCase().includes(keyword)) {
        score += 1;
      }
    }
    // Check if job title appears in experience
    const roleWords = pattern.role.toLowerCase().split(' ');
    for (const word of roleWords) {
      if (experienceSection.toLowerCase().includes(word)) {
        score += 3;
      }
    }
    if (score > bestRole.score) {
      bestRole = { role: pattern.role, industry: pattern.industry, score: score };
    }
  }
  
  console.log("🏆 Best Role:", bestRole.role, "Industry:", bestRole.industry, "Score:", bestRole.score);
  
  // ==================== STEP 4: EXTRACT ALL MENTIONED ROLES ====================
  const allRoles: string[] = [];
  for (const pattern of jobRolePatterns) {
    const roleWords = pattern.role.toLowerCase().split(' ');
    for (const word of roleWords) {
      if (experienceSection.toLowerCase().includes(word) || text.toLowerCase().includes(word)) {
        if (!allRoles.includes(pattern.role)) {
          allRoles.push(pattern.role);
        }
      }
    }
  }
  
  return {
    primaryRole: bestRole.role,
    allRoles: allRoles.slice(0, 5),
    industry: bestRole.industry,
    confidence: Math.min(bestRole.score / 20, 1)
  };
}

// ==================== DOMAIN DATABASE ====================
const domainDatabase = {
  'finance/payroll': {
    jobTitles: ['Payroll Specialist', 'Tax Analyst', 'Benefits Analyst', 'Finance Manager', 'Accountant', 'Auditor', 'Compliance Officer'],
    skills: ['Payroll Processing', 'Tax Compliance', 'Financial Reporting', 'W-2/1099', 'FICA/SUTA/FUTA', 'Audit', 'Reconciliation'],
    searchTerms: ['payroll', 'tax', 'finance', 'accounting', 'compliance']
  },
  'technology': {
    jobTitles: ['Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Data Engineer'],
    skills: ['React', 'Python', 'JavaScript', 'AWS', 'Docker', 'SQL', 'DevOps', 'Cloud Computing'],
    searchTerms: ['developer', 'engineer', 'software', 'programming']
  },
  'sales': {
    jobTitles: ['Sales Manager', 'Business Development Manager', 'Account Executive'],
    skills: ['Sales', 'Business Development', 'Lead Generation', 'Negotiation', 'CRM'],
    searchTerms: ['sales', 'business development', 'account manager']
  },
  'hr': {
    jobTitles: ['HR Manager', 'Recruiter', 'Talent Acquisition Specialist'],
    skills: ['HR Management', 'Recruitment', 'Talent Acquisition', 'Employee Relations'],
    searchTerms: ['hr', 'human resources', 'recruitment']
  },
  'design': {
    jobTitles: ['UI/UX Designer', 'Graphic Designer', 'Product Designer'],
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Visual Design'],
    searchTerms: ['design', 'ui/ux', 'graphic', 'creative']
  },
  'marketing': {
    jobTitles: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist'],
    skills: ['Marketing', 'Digital Marketing', 'SEO', 'Content Strategy', 'Social Media'],
    searchTerms: ['marketing', 'digital marketing', 'seo', 'content']
  },
  'operations': {
    jobTitles: ['Operations Manager', 'Supply Chain Manager', 'Logistics Manager'],
    skills: ['Operations', 'Supply Chain', 'Logistics', 'Inventory Management', 'Procurement'],
    searchTerms: ['operations', 'supply chain', 'logistics', 'procurement']
  },
  'call centre': {
    jobTitles: ['Customer Service Manager', 'Call Centre Manager', 'Team Leader'],
    skills: ['Customer Service', 'Call Centre Operations', 'Inbound/Outbound', 'Query Resolution'],
    searchTerms: ['customer service', 'call centre', 'bpo', 'support']
  },
  'healthcare': {
    jobTitles: ['Healthcare Administrator', 'Clinical Manager', 'Nurse', 'Medical Officer'],
    skills: ['Healthcare', 'Patient Care', 'Clinical Operations', 'Medical Records'],
    searchTerms: ['healthcare', 'medical', 'clinical', 'nursing']
  },
  'legal': {
    jobTitles: ['Legal Counsel', 'Compliance Officer', 'Corporate Lawyer'],
    skills: ['Legal', 'Compliance', 'Corporate Law', 'Contract Management'],
    searchTerms: ['legal', 'law', 'compliance', 'regulatory']
  },
  'education': {
    jobTitles: ['Teacher', 'Professor', 'Trainer', 'Instructional Designer'],
    skills: ['Teaching', 'Curriculum Development', 'Training', 'Instructional Design'],
    searchTerms: ['education', 'teaching', 'training', 'academic']
  },
  'engineering': {
    jobTitles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer'],
    skills: ['Engineering', 'Mechanical Design', 'CAD/CAM', 'Project Management'],
    searchTerms: ['engineering', 'mechanical', 'electrical', 'civil']
  },
  'consulting': {
    jobTitles: ['Management Consultant', 'Strategy Consultant', 'Business Analyst'],
    skills: ['Consulting', 'Strategy', 'Business Analysis', 'Change Management'],
    searchTerms: ['consulting', 'strategy', 'business analysis', 'advisory']
  },
  'data analytics': {
    jobTitles: ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst'],
    skills: ['Data Analysis', 'Data Science', 'Business Intelligence', 'Power BI', 'Tableau'],
    searchTerms: ['data', 'analytics', 'data science', 'business intelligence']
  },
  'project management': {
    jobTitles: ['Project Manager', 'Scrum Master', 'Product Owner', 'Program Manager'],
    skills: ['Project Management', 'Agile', 'Scrum', 'Jira', 'Stakeholder Management'],
    searchTerms: ['project management', 'scrum', 'agile', 'pmp']
  },
  'manufacturing': {
    jobTitles: ['Manufacturing Engineer', 'Production Manager', 'Plant Manager', 'Quality Engineer'],
    skills: ['Manufacturing', 'Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Production Planning'],
    searchTerms: ['manufacturing', 'production', 'plant', 'quality', 'lean']
  },
  'hospitality': {
    jobTitles: ['Hotel Manager', 'Restaurant Manager', 'Event Manager', 'Front Office Manager'],
    skills: ['Hospitality Management', 'Guest Services', 'Food and Beverage', 'Event Management'],
    searchTerms: ['hospitality', 'hotel', 'restaurant', 'tourism', 'travel']
  },
  'retail': {
    jobTitles: ['Retail Manager', 'Store Manager', 'Category Manager', 'Merchandiser'],
    skills: ['Retail Operations', 'Store Management', 'Merchandising', 'Category Management'],
    searchTerms: ['retail', 'fmcg', 'store', 'merchandising', 'inventory']
  },
  'media': {
    jobTitles: ['Producer', 'Director', 'Editor', 'Journalist', 'Content Creator'],
    skills: ['Video Production', 'Editing', 'Journalism', 'Content Creation', 'Directing'],
    searchTerms: ['media', 'entertainment', 'video', 'production', 'journalism']
  },
  'construction': {
    jobTitles: ['Construction Manager', 'Site Manager', 'Civil Engineer', 'Architect'],
    skills: ['Construction Management', 'Project Management', 'Site Management', 'Cost Estimation'],
    searchTerms: ['construction', 'civil', 'architecture', 'real estate', 'building']
  },
  'logistics': {
    jobTitles: ['Logistics Manager', 'Transportation Manager', 'Warehouse Manager', 'Supply Chain Manager'],
    skills: ['Logistics', 'Supply Chain', 'Transportation', 'Warehouse Operations', 'Inventory Management'],
    searchTerms: ['logistics', 'transportation', 'freight', 'warehouse', 'supply chain']
  }
};

// ==================== EXTRACT SKILLS ====================
function extractSkillsFromDomain(domain: string): {
  skills: string[];
  jobRoles: string[];
} {
  const domainData = domainDatabase[domain as keyof typeof domainDatabase];
  if (domainData) {
    return {
      skills: domainData.skills || [],
      jobRoles: domainData.jobTitles || []
    };
  }
  return {
    skills: ['Payroll', 'Tax', 'Finance', 'Accounting', 'Compliance'],
    jobRoles: ['Payroll Specialist', 'Tax Analyst']
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
    
    // ==================== EXTRACT JOB ROLES FROM EXPERIENCE ====================
    const roleDetection = extractJobRolesFromExperience(cvText);
    
    console.log("🏆 Primary Role:", roleDetection.primaryRole);
    console.log("📋 All Roles:", roleDetection.allRoles);
    console.log("🏢 Industry:", roleDetection.industry);
    console.log("📊 Confidence:", roleDetection.confidence);
    
    // ==================== DETERMINE DOMAIN ====================
    let domain = roleDetection.industry.toLowerCase().replace('/', '').replace(' ', '').replace('&', '');
    
    // Map industry to domain key
    const industryMap: { [key: string]: string } = {
      'finance/payroll': 'finance/payroll',
      'technology': 'technology',
      'sales': 'sales',
      'hr': 'hr',
      'design': 'design',
      'marketing': 'marketing',
      'operations': 'operations',
      'call centre': 'call centre',
      'healthcare': 'healthcare',
      'legal': 'legal',
      'education': 'education',
      'engineering': 'engineering',
      'consulting': 'consulting',
      'data analytics': 'data analytics',
      'project management': 'project management',
      'manufacturing': 'manufacturing',
      'hospitality': 'hospitality',
      'retail': 'retail',
      'media': 'media',
      'construction': 'construction',
      'logistics': 'logistics'
    };
    
    const domainKey = industryMap[domain] || 'finance/payroll';
    
    console.log("🎯 Domain Key:", domainKey);
    
    // ==================== EXTRACT SKILLS ====================
    const extractionResult = extractSkillsFromDomain(domainKey);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    
    console.log("🎯 Skills:", extractedSkills.slice(0, 5));
    console.log("💼 Job Roles:", detectedJobRoles);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // ==================== BUILD SEARCH QUERIES ====================
    let searchTerms: string[] = [];
    
    // Use the primary role as search term
    if (roleDetection.primaryRole) {
      searchTerms.push(roleDetection.primaryRole);
    }
    
    // Add all roles
    searchTerms.push(...roleDetection.allRoles);
    
    // Add domain-specific search terms
    const domainData = domainDatabase[domainKey as keyof typeof domainDatabase];
    if (domainData) {
      searchTerms.push(...domainData.searchTerms);
    }
    
    // Remove duplicates
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    if (searchTerms.length === 0) {
      searchTerms = ['payroll tax finance'];
    }
    
    console.log("🔍 Search Terms:", searchTerms.slice(0, 10));
    
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
                industry: roleDetection.industry,
                primaryRole: roleDetection.primaryRole
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
    console.log("📊 Industry used:", roleDetection.industry);
    console.log("🏆 Primary Role:", roleDetection.primaryRole);
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      jobRoles: detectedJobRoles,
      detectedDomain: domainKey,
      detectedIndustry: roleDetection.industry,
      primaryRole: roleDetection.primaryRole,
      allRoles: roleDetection.allRoles,
      domainConfidence: roleDetection.confidence,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'Experience-Based Job Detection'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}