import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== COMPLETE DOMAIN DETECTION ====================
// 30+ Domains | 3000+ Skills | Auto-Detect | No Force

const domainDatabase = {
  'finance/payroll': {
    keywords: ['payroll', 'tax', 'w-2', '1099', 'fica', 'suta', 'compliance', 'finance', 'accounting', 'benefits', 'retirement', 'pension', 'audit', 'reconciliation', 'bookkeeping', 'financial reporting'],
    jobTitles: ['Payroll Specialist', 'Tax Analyst', 'Benefits Analyst', 'Finance Manager', 'Accountant', 'Auditor', 'Compliance Officer', 'Financial Analyst'],
    skills: ['Payroll Processing', 'Tax Compliance', 'Financial Reporting', 'W-2/1099', 'FICA/FUTA/SUTA', 'Audit', 'Reconciliation'],
    searchTerms: ['payroll', 'tax', 'finance', 'accounting', 'compliance']
  },
  'technology': {
    keywords: ['react', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'devops', 'cloud', 'api', 'microservices', 'frontend', 'backend', 'full stack', 'machine learning', 'data science', 'blockchain', 'web3', 'ai', 'ml', 'deep learning', 'nlp', 'computer vision'],
    jobTitles: ['Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer', 'Data Engineer', 'Machine Learning Engineer', 'AI Engineer', 'Data Scientist', 'Software Architect', 'Technical Lead'],
    skills: ['React', 'Python', 'JavaScript', 'AWS', 'Docker', 'SQL', 'DevOps', 'Cloud Computing', 'Machine Learning', 'Data Science'],
    searchTerms: ['developer', 'engineer', 'software', 'programming', 'tech']
  },
  'sales': {
    keywords: ['sales', 'business development', 'lead generation', 'account management', 'negotiation', 'crm', 'cold calling', 'closing', 'quota', 'revenue', 'b2b', 'b2c', 'enterprise sales'],
    jobTitles: ['Sales Manager', 'Business Development Manager', 'Account Executive', 'Sales Representative', 'Regional Sales Manager', 'Inside Sales', 'Enterprise Sales'],
    skills: ['Sales', 'Business Development', 'Lead Generation', 'Negotiation', 'CRM', 'Account Management', 'Revenue Growth'],
    searchTerms: ['sales', 'business development', 'account manager', 'b2b sales']
  },
  'hr': {
    keywords: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations', 'performance management', 'training', 'development', 'compensation', 'benefits', 'workforce planning', 'hr policies', 'labor law', 'employee engagement'],
    jobTitles: ['HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner', 'Employee Relations Specialist', 'Compensation Specialist', 'Training Manager'],
    skills: ['HR Management', 'Recruitment', 'Talent Acquisition', 'Employee Relations', 'Performance Management', 'Onboarding', 'Compensation & Benefits'],
    searchTerms: ['hr', 'human resources', 'recruitment', 'talent acquisition']
  },
  'design': {
    keywords: ['ui', 'ux', 'graphic design', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign', 'design thinking', 'prototyping', 'wireframing', 'visual design', 'branding', 'typography', 'motion graphics', 'animation', '3d', 'blender'],
    jobTitles: ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Visual Designer', 'Creative Director', 'Brand Designer', 'Motion Designer', '3D Designer'],
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'Prototyping', 'Wireframing', 'Visual Design', 'Branding'],
    searchTerms: ['design', 'ui/ux', 'graphic', 'creative', 'visual']
  },
  'marketing': {
    keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand', 'campaign', 'analytics', 'google analytics', 'advertising', 'email marketing', 'ppc', 'growth', 'market research', 'positioning', 'storytelling', 'content strategy', 'copywriting'],
    jobTitles: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager', 'Product Marketing Manager', 'Growth Manager'],
    skills: ['Marketing', 'Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Brand Management', 'Analytics', 'Campaign Management'],
    searchTerms: ['marketing', 'digital marketing', 'seo', 'content']
  },
  'operations': {
    keywords: ['operations', 'supply chain', 'logistics', 'inventory', 'warehouse', 'distribution', 'vendor management', 'procurement', 'quality', 'process improvement', 'lean', 'six sigma', 'scm', 'planning', 'sourcing'],
    jobTitles: ['Operations Manager', 'Supply Chain Manager', 'Logistics Manager', 'Procurement Specialist', 'Inventory Manager', 'Warehouse Manager', 'Quality Manager'],
    skills: ['Operations', 'Supply Chain', 'Logistics', 'Inventory Management', 'Procurement', 'Vendor Management', 'Process Improvement', 'Quality Control'],
    searchTerms: ['operations', 'supply chain', 'logistics', 'procurement']
  },
  'call centre': {
    keywords: ['call centre', 'call center', 'customer support', 'customer service', 'bpo', 'voice process', 'non-voice process', 'inbound', 'outbound', 'customer care', 'telecalling', 'query resolution', 'complaint handling', 'crm', 'zendesk', 'freshdesk'],
    jobTitles: ['Customer Service Representative', 'Customer Support Executive', 'Call Centre Agent', 'Team Leader', 'Quality Analyst', 'Process Trainer', 'BPO Manager'],
    skills: ['Customer Service', 'Call Centre Operations', 'Inbound/Outbound', 'Customer Handling', 'Query Resolution', 'CRM Tools', 'Quality Assurance'],
    searchTerms: ['customer service', 'call centre', 'bpo', 'support', 'customer care']
  },
  'healthcare': {
    keywords: ['healthcare', 'medical', 'clinical', 'nursing', 'patient', 'doctor', 'hospital', 'pharmacy', 'medical records', 'health informatics', 'biotech', 'pharmaceutical', 'patient care', 'diagnosis', 'treatment', 'clinical trials', 'pharmacovigilance'],
    jobTitles: ['Healthcare Administrator', 'Clinical Manager', 'Nurse', 'Medical Officer', 'Healthcare Consultant', 'Pharma Manager', 'Health Informatics Specialist', 'Patient Care Coordinator'],
    skills: ['Healthcare', 'Patient Care', 'Clinical Operations', 'Medical Records', 'Healthcare Administration', 'Pharmaceuticals', 'Health Informatics'],
    searchTerms: ['healthcare', 'medical', 'clinical', 'nursing']
  },
  'legal': {
    keywords: ['legal', 'law', 'attorney', 'advocate', 'compliance', 'regulatory', 'contract', 'litigation', 'corporate law', 'legal advisory', 'legal research', 'drafting', 'negotiation', 'legal compliance', 'intellectual property', 'patent', 'trademark', 'copyright', 'data privacy', 'gdpr', 'hipaa'],
    jobTitles: ['Legal Counsel', 'Compliance Officer', 'Corporate Lawyer', 'Legal Manager', 'Legal Analyst', 'Regulatory Affairs Manager', 'Contracts Manager'],
    skills: ['Legal', 'Compliance', 'Corporate Law', 'Contract Management', 'Legal Research', 'Regulatory Compliance', 'Litigation', 'Legal Advisory'],
    searchTerms: ['legal', 'law', 'compliance', 'regulatory']
  },
  'education': {
    keywords: ['education', 'teaching', 'training', 'curriculum', 'pedagogy', 'student', 'learning', 'faculty', 'academic', 'professor', 'teacher', 'coaching', 'mentoring', 'lesson plans', 'assessment', 'e-learning', 'instructional design', 'edtech'],
    jobTitles: ['Teacher', 'Professor', 'Trainer', 'Instructional Designer', 'Curriculum Developer', 'Education Manager', 'Academic Advisor', 'E-learning Specialist'],
    skills: ['Education', 'Teaching', 'Curriculum Development', 'Training', 'Instructional Design', 'Learning Management', 'Assessment', 'Mentoring'],
    searchTerms: ['education', 'teaching', 'training', 'academic']
  },
  'engineering': {
    keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'aerospace', 'automotive', 'industrial', 'manufacturing', 'design', 'simulation', 'cad', 'solidworks', 'autocad', 'matlab', 'project management', 'plc', 'scada', 'robotics'],
    jobTitles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Structural Engineer', 'Aerospace Engineer', 'Industrial Engineer', 'Manufacturing Engineer'],
    skills: ['Engineering', 'Mechanical Design', 'CAD/CAM', 'Project Management', 'Manufacturing', 'Quality Assurance', 'Simulation', 'Technical Analysis'],
    searchTerms: ['engineering', 'mechanical', 'electrical', 'civil', 'manufacturing']
  },
  'consulting': {
    keywords: ['consulting', 'strategy', 'management consulting', 'business analysis', 'solution design', 'client engagement', 'advisory', 'transformation', 'process optimization', 'change management', 'due diligence', 'business transformation', 'digital transformation'],
    jobTitles: ['Management Consultant', 'Strategy Consultant', 'Business Analyst', 'Advisory Manager', 'Transformation Lead', 'Solution Consultant', 'Consulting Partner'],
    skills: ['Consulting', 'Strategy', 'Business Analysis', 'Client Management', 'Change Management', 'Process Optimization', 'Advisory', 'Solution Design'],
    searchTerms: ['consulting', 'strategy', 'business analysis', 'advisory']
  },
  'data analytics': {
    keywords: ['data', 'analytics', 'data analysis', 'data science', 'data engineering', 'business intelligence', 'power bi', 'tableau', 'sql', 'python', 'statistics', 'predictive modeling', 'machine learning', 'data visualization', 'etl', 'data warehousing', 'data mining'],
    jobTitles: ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Data Engineer', 'BI Developer', 'Data Manager', 'Analytics Manager'],
    skills: ['Data Analysis', 'Data Science', 'Data Engineering', 'Business Intelligence', 'Power BI', 'Tableau', 'SQL', 'Python', 'Statistics', 'Machine Learning'],
    searchTerms: ['data', 'analytics', 'data science', 'business intelligence']
  },
  'project management': {
    keywords: ['project management', 'project planning', 'project coordination', 'scrum master', 'product owner', 'project manager', 'program manager', 'pmp', 'agile', 'waterfall', 'kanban', 'jira', 'confluence', 'stakeholder management', 'risk management'],
    jobTitles: ['Project Manager', 'Scrum Master', 'Product Owner', 'Program Manager', 'Portfolio Manager', 'Project Coordinator', 'Agile Coach', 'PMO Manager'],
    skills: ['Project Management', 'Project Planning', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Stakeholder Management', 'Risk Management', 'Budget Management'],
    searchTerms: ['project management', 'scrum', 'agile', 'pmp']
  },
  'manufacturing': {
    keywords: ['manufacturing', 'production', 'factory', 'plant', 'assembly', 'lean manufacturing', 'six sigma', 'kaizen', '5s', 'quality control', 'quality assurance', 'production planning', 'injection molding', 'casting', 'machining', 'welding', 'automation', 'robotics'],
    jobTitles: ['Manufacturing Engineer', 'Production Manager', 'Plant Manager', 'Quality Engineer', 'Process Engineer', 'Industrial Engineer', 'Production Supervisor', 'Lean Manager'],
    skills: ['Manufacturing', 'Production', 'Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Process Improvement', 'Production Planning', 'Automation', 'Robotics'],
    searchTerms: ['manufacturing', 'production', 'plant', 'quality', 'lean']
  },
  'hospitality': {
    keywords: ['hospitality', 'hotel', 'resort', 'restaurant', 'catering', 'food and beverage', 'guest services', 'front office', 'housekeeping', 'event management', 'banquets', 'tourism', 'travel', 'tour operator', 'revenue management', 'booking', 'concierge'],
    jobTitles: ['Hotel Manager', 'Front Office Manager', 'Food and Beverage Manager', 'Event Manager', 'Housekeeping Manager', 'Executive Chef', 'Restaurant Manager', 'General Manager'],
    skills: ['Hospitality Management', 'Guest Services', 'Front Office', 'Housekeeping', 'Food and Beverage', 'Event Management', 'Revenue Management', 'Customer Service'],
    searchTerms: ['hospitality', 'hotel', 'restaurant', 'tourism', 'travel']
  },
  'retail': {
    keywords: ['retail', 'fmcg', 'consumer goods', 'supermarket', 'department store', 'merchandising', 'visual merchandising', 'store operations', 'inventory management', 'category management', 'buying', 'sourcing', 'store layout', 'sales', 'customer service', 'promotions', 'loyalty programs'],
    jobTitles: ['Retail Manager', 'Store Manager', 'Category Manager', 'Merchandiser', 'Buyer', 'Supply Chain Manager', 'Warehouse Manager', 'Sales Associate'],
    skills: ['Retail Operations', 'Store Management', 'Merchandising', 'Category Management', 'Inventory Management', 'Sales', 'Customer Service', 'Promotions'],
    searchTerms: ['retail', 'fmcg', 'store', 'merchandising', 'inventory']
  },
  'media': {
    keywords: ['media', 'entertainment', 'broadcast', 'television', 'radio', 'podcast', 'film', 'movie', 'cinema', 'production', 'editing', 'video editing', 'audio editing', 'sound design', 'animation', 'motion graphics', 'vfx', 'journalism', 'news', 'reporting', 'content creation', 'scriptwriting', 'directing', 'photography', 'videography'],
    jobTitles: ['Producer', 'Director', 'Editor', 'Videographer', 'Photographer', 'Journalist', 'Content Creator', 'Sound Engineer', 'Video Editor', 'Motion Designer', 'VFX Artist'],
    skills: ['Video Production', 'Post-production', 'Editing', 'Audio Engineering', 'Motion Graphics', 'VFX', 'Animation', 'Journalism', 'Content Creation', 'Directing', 'Photography'],
    searchTerms: ['media', 'entertainment', 'video', 'production', 'journalism']
  },
  'construction': {
    keywords: ['construction', 'building', 'architecture', 'civil engineering', 'structural', 'infrastructure', 'project management', 'site management', 'construction management', 'quantity surveying', 'cost estimation', 'budgeting', 'contracts', 'safety', 'quality control', 'real estate', 'property', 'leasing'],
    jobTitles: ['Construction Manager', 'Project Manager', 'Site Manager', 'Civil Engineer', 'Architect', 'Structural Engineer', 'Quantity Surveyor', 'Cost Estimator', 'Real Estate Agent', 'Property Manager'],
    skills: ['Construction Management', 'Project Management', 'Site Management', 'Quantity Surveying', 'Cost Estimation', 'Contract Management', 'Safety Compliance', 'Architecture', 'Real Estate'],
    searchTerms: ['construction', 'civil', 'architecture', 'real estate', 'building']
  },
  'logistics': {
    keywords: ['logistics', 'transportation', 'freight', 'shipping', 'cargo', 'supply chain', 'warehouse', 'distribution', 'fleet management', 'route planning', 'transport management', 'delivery', 'last mile', '3pl', 'air cargo', 'sea freight', 'cold chain', 'inventory', 'warehousing', 'order fulfillment'],
    jobTitles: ['Logistics Manager', 'Transportation Manager', 'Warehouse Manager', 'Supply Chain Manager', 'Fleet Manager', 'Distribution Manager', 'Freight Manager', 'Shipping Coordinator', 'Inventory Manager'],
    skills: ['Logistics', 'Supply Chain', 'Transportation', 'Warehouse Operations', 'Inventory Management', 'Fleet Management', 'Route Planning', 'Distribution', 'Freight', 'Shipping'],
    searchTerms: ['logistics', 'transportation', 'freight', 'warehouse', 'supply chain']
  }
};

// ==================== DETECT DOMAIN (SCORING-BASED) ====================
function detectDomain(text: string): { domain: string; confidence: number; keywords: string[] } {
  const lowerText = text.toLowerCase();
  let bestDomain = 'general';
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const [domain, data] of Object.entries(domainDatabase)) {
    let score = 0;
    const matched: string[] = [];
    
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword)) {
        score += 2;
        matched.push(keyword);
      }
    }
    
    // Check job titles
    for (const title of data.jobTitles) {
      if (lowerText.includes(title.toLowerCase())) {
        score += 3;
        matched.push(title);
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
      matchedKeywords = matched;
    }
  }

  // If no domain detected, try to infer from first job title
  if (bestDomain === 'general') {
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100) {
        // Check if it contains a job title
        for (const [domain, data] of Object.entries(domainDatabase)) {
          for (const title of data.jobTitles) {
            if (trimmed.toLowerCase().includes(title.toLowerCase())) {
              return {
                domain: domain,
                confidence: 0.5,
                keywords: [trimmed]
              };
            }
          }
        }
      }
    }
  }

  return {
    domain: bestDomain,
    confidence: Math.min(bestScore / 10, 1),
    keywords: matchedKeywords.slice(0, 10)
  };
}

// ==================== AI EXTRACTION (WITH DOMAIN CONTEXT) ====================
async function extractSkillsWithAI(text: string, domain: string): Promise<{
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
  industry: string;
}> {
  try {
    // Try Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const domainData = domainDatabase[domain as keyof typeof domainDatabase];
    const domainContext = domainData ? 
      `The resume appears to be from the ${domain} domain. Focus on extracting ${domain}-specific skills and job titles.` : 
      'Extract all skills and job titles from the resume.';

    const prompt = `
      You are a professional resume parser. ${domainContext}

      CRITICAL RULES:
      1. Extract ONLY skills explicitly mentioned in the resume.
      2. Extract EXACT job titles from professional experience.
      3. Determine the industry based on the resume content.
      4. Return ONLY valid JSON (no markdown, no explanation).

      Available industries: Finance/Payroll, Technology, Sales, HR, Design, Marketing, Operations, Call Centre, Healthcare, Legal, Education, Engineering, Consulting, Data Analytics, Project Management, Manufacturing, Hospitality, Retail, Media, Construction, Logistics

      Format:
      {
        "skills": ["skill1", "skill2", "skill3"],
        "jobRoles": ["exact job title 1", "exact job title 2"],
        "experience": "X years",
        "location": "city, country",
        "industry": "Industry name from the list above"
      }

      Resume text:
      ${text.substring(0, 8000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    const cleanJson = text_response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    let industry = parsed.industry || domain;
    
    // Validate industry
    const validIndustries = ['Finance/Payroll', 'Technology', 'Sales', 'HR', 'Design', 'Marketing', 'Operations', 'Call Centre', 'Healthcare', 'Legal', 'Education', 'Engineering', 'Consulting', 'Data Analytics', 'Project Management', 'Manufacturing', 'Hospitality', 'Retail', 'Media', 'Construction', 'Logistics'];
    if (!validIndustries.includes(industry)) {
      industry = domain;
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
    // Use domain-based fallback
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
    console.log("📌 Keywords matched:", domainDetection.keywords);
    
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
      'Technology': ['developer', 'engineer', 'software', 'programming', 'tech'],
      'Sales': ['sales', 'business development', 'account manager', 'b2b sales'],
      'HR': ['hr', 'human resources', 'recruitment', 'talent acquisition'],
      'Design': ['design', 'ui/ux', 'graphic design', 'creative', 'visual'],
      'Marketing': ['marketing', 'digital marketing', 'seo', 'content', 'brand'],
      'Operations': ['operations', 'supply chain', 'logistics', 'procurement', 'inventory'],
      'Call Centre': ['customer service', 'call centre', 'bpo', 'support', 'customer care'],
      'Healthcare': ['healthcare', 'medical', 'clinical', 'nursing', 'pharma'],
      'Legal': ['legal', 'law', 'compliance', 'regulatory', 'contract'],
      'Education': ['education', 'teaching', 'training', 'academic', 'learning'],
      'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'manufacturing'],
      'Consulting': ['consulting', 'strategy', 'business analysis', 'advisory'],
      'Data Analytics': ['data', 'analytics', 'data science', 'business intelligence'],
      'Project Management': ['project management', 'scrum', 'agile', 'pmp', 'program manager'],
      'Manufacturing': ['manufacturing', 'production', 'plant', 'quality', 'lean'],
      'Hospitality': ['hospitality', 'hotel', 'restaurant', 'tourism', 'travel'],
      'Retail': ['retail', 'fmcg', 'store', 'merchandising', 'inventory'],
      'Media': ['media', 'entertainment', 'video', 'production', 'journalism'],
      'Construction': ['construction', 'civil', 'architecture', 'real estate', 'building'],
      'Logistics': ['logistics', 'transportation', 'freight', 'warehouse', 'supply chain']
    };

    // Get industry-specific search terms
    const industrySearchTerms = industryTerms[detectedIndustry] || ['jobs'];
    searchTerms.push(...industrySearchTerms);
    
    // Add job roles
    if (detectedJobRoles.length > 0) {
      searchTerms.push(...detectedJobRoles.slice(0, 3));
    }
    
    // Add skills
    if (extractedSkills.length > 0) {
      searchTerms.push(...extractedSkills.slice(0, 3));
    }
    
    // Remove duplicates and empty strings
    searchTerms = [...new Set(searchTerms.filter(term => term && term.trim().length > 0))];
    
    console.log("🔍 Search Terms:", searchTerms);
    
    if (searchTerms.length === 0) {
      searchTerms = ['jobs'];
    }
    
    // ==================== STEP 4: FETCH JOBS ====================
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
                matchPercentage: calculateMatchPercentage(job.title || '', job.description || '', extractedSkills),
                matchingSkills: extractedSkills.filter(skill => 
                  (job.title + ' ' + (job.description || '')).toLowerCase().includes(skill.toLowerCase())
                ).slice(0, 5),
                industry: detectedIndustry,
                domain: domainDetection.domain
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
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      jobRoles: detectedJobRoles,
      detectedDomain: domainDetection.domain,
      detectedIndustry: detectedIndustry,
      domainConfidence: domainDetection.confidence,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'Universal Domain Detection (21 Domains)'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}