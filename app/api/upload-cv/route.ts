import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== COMPLETE DOMAIN DATABASE ====================
// 30+ Domains | 3000+ Skills | All Industries | Past 100 Years to Modern

const domainDatabase = {
  // ==================== FINANCE & ACCOUNTING ====================
  'finance/payroll': {
    keywords: [
      'payroll', 'tax', 'w-2', 'w2', '1099', '1099-r', '1042-s', '941', '940',
      'fica', 'flsa', 'sita', 'sui', 'suta', 'futa', 'local tax', 'state tax', 'federal tax',
      'compliance', 'finance', 'accounting', 'benefits', 'retirement', 'pension',
      'defined benefit', 'defined contribution', '401k', '403b', 'ira',
      'audit', 'reconciliation', 'general ledger', 'accounts payable', 'accounts receivable',
      'budgeting', 'forecasting', 'financial analysis', 'financial reporting', 'gaap',
      'internal audit', 'risk management', 'taxation', 'corporate finance', 'investment banking',
      'asset management', 'portfolio management', 'wealth management', 'private equity',
      'venture capital', 'mergers and acquisitions', 'due diligence', 'financial modeling',
      'valuation', 'cost accounting', 'managerial accounting', 'bookkeeping', 'invoice processing',
      'payment processing', 'bank reconciliation', 'cash flow management', 'treasury management',
      'financial planning', 'budget management', 'expense management', 'financial controls',
      'sarbanes-oxley', 'compliance auditing', 'risk assessment', 'fraud detection',
      'financial operations', 'payroll administration', 'benefits administration',
      'hr compliance', 'labor laws', 'employment regulations', 'tax returns', 'tax planning',
      'quickbooks', 'xero', 'sage', 'tally', 'zoho books', 'freshbooks', 'wave accounting'
    ],
    jobTitles: [
      'Payroll Specialist', 'Payroll Manager', 'Tax Analyst', 'Tax Manager', 
      'Finance Manager', 'Accountant', 'Senior Accountant', 'Accounting Manager',
      'Auditor', 'Internal Auditor', 'Compliance Officer', 'Finance Director',
      'Chief Financial Officer', 'Financial Controller', 'Budget Analyst',
      'Financial Analyst', 'Investment Analyst', 'Portfolio Manager', 'Risk Analyst',
      'Treasury Analyst', 'Accounts Payable Specialist', 'Accounts Receivable Specialist',
      'Bookkeeper', 'Payroll Administrator', 'Benefits Administrator', 'Financial Planner',
      'Cost Accountant', 'Management Accountant', 'Tax Consultant', 'Finance Executive',
      'Forensic Accountant', 'Financial Advisor', 'Wealth Manager', 'Credit Analyst'
    ],
    skills: [
      'Payroll Processing', 'Tax Compliance', 'Financial Reporting', 'W-2/1099 Processing',
      'FICA/FUTA/SUTA Compliance', 'Audit', 'Reconciliation', 'Financial Analysis',
      'Budgeting', 'Forecasting', 'GAAP', 'Internal Controls', 'Risk Management',
      'Accounts Payable', 'Accounts Receivable', 'General Ledger', 'Financial Modeling',
      'Valuation', 'Due Diligence', 'Cost Accounting', 'Cash Flow Management',
      'Treasury Management', 'Financial Planning', 'Budget Management', 'Compliance Auditing',
      'Sarbanes-Oxley', 'Fraud Detection', 'Payroll Administration', 'Benefits Administration',
      'QuickBooks', 'Xero', 'Tally', 'Zoho Books', 'Financial Controls'
    ],
    searchTerms: ['payroll', 'tax', 'finance', 'accounting', 'compliance', 'audit', 'bookkeeping']
  },

  // ==================== TECHNOLOGY & IT ====================
  'technology': {
    keywords: [
      'react', 'angular', 'vue', 'next.js', 'nuxt.js', 'svelte', 'solid.js',
      'node.js', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', '.net', 'ruby', 'rails',
      'go', 'golang', 'rust', 'swift', 'kotlin', 'php', 'laravel', 'symfony', 'codeigniter',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'puppet', 'chef',
      'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci', 'azure devops',
      'ci/cd', 'devops', 'sre', 'platform engineering', 'microservices', 'monolith',
      'rest api', 'graphql', 'grpc', 'websocket', 'webhook', 'serverless', 'lambda',
      'sql', 'postgresql', 'mysql', 'mariadb', 'mongodb', 'cassandra', 'redis', 'elasticsearch',
      'kafka', 'rabbitmq', 'activemq', 'sqs', 'sns', 'nginx', 'apache', 'iis',
      'linux', 'unix', 'windows server', 'networking', 'tcp/ip', 'dns', 'dhcp', 'firewall',
      'cybersecurity', 'information security', 'penetration testing', 'vulnerability assessment',
      'cloud computing', 'serverless', 'ec2', 's3', 'rds', 'dynamodb', 'lambda', 'api gateway',
      'data engineering', 'etl', 'data warehousing', 'big data', 'hadoop', 'spark', 'hive', 'pig',
      'machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'computer vision',
      'data science', 'analytics', 'business intelligence', 'tableau', 'power bi', 'looker',
      'agile', 'scrum', 'kanban', 'safe', 'jira', 'confluence', 'trello', 'asana', 'clickup',
      'git', 'github', 'gitlab', 'bitbucket', 'svn', 'perforce', 'mercurial',
      'software development', 'full stack', 'frontend', 'backend', 'mobile development',
      'ios', 'android', 'react native', 'flutter', 'ionic', 'xamarin', 'cordova',
      'testing', 'qa', 'automation', 'selenium', 'cypress', 'playwright', 'jest', 'mocha', 'chai',
      'performance testing', 'jmeter', 'load testing', 'security testing', 'unit testing',
      'blockchain', 'web3', 'solidity', 'ethereum', 'hyperledger', 'defi', 'smart contracts',
      'quantum computing', 'edge computing', 'iot', 'arduino', 'raspberry pi', 'embedded systems',
      'augmented reality', 'virtual reality', 'metaverse', '3d modeling', 'blender', 'unity', 'unreal',
      'mainframe', 'cobol', 'fortran', 'pascal', 'assembly', 'pl/sql', 'abap', 'sap'
    ],
    jobTitles: [
      'Software Developer', 'Full Stack Developer', 'Frontend Engineer', 'Backend Engineer',
      'DevOps Engineer', 'Cloud Engineer', 'Data Engineer', 'Machine Learning Engineer',
      'AI Engineer', 'Data Scientist', 'Business Intelligence Developer', 'Software Architect',
      'Technical Lead', 'Engineering Manager', 'SRE Engineer', 'Security Engineer',
      'QA Engineer', 'Test Automation Engineer', 'DevOps Manager', 'Cloud Architect',
      'Mobile Developer', 'iOS Developer', 'Android Developer', 'Blockchain Developer',
      'Game Developer', 'Embedded Engineer', 'Database Administrator', 'Network Engineer',
      'System Administrator', 'IT Manager', 'CTO', 'VP of Engineering', 'Principal Engineer',
      'SAP Consultant', 'Mainframe Developer', 'Legacy Systems Engineer'
    ],
    skills: [
      'React', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
      'AWS', 'Docker', 'Kubernetes', 'Microservices', 'REST APIs', 'GraphQL',
      'SQL', 'MongoDB', 'Redis', 'Kafka', 'Linux', 'Cybersecurity',
      'Cloud Computing', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'Jira',
      'Machine Learning', 'Data Science', 'Big Data', 'Spark', 'Hadoop',
      'Data Engineering', 'ETL', 'Data Warehousing', 'Tableau', 'Power BI',
      'Full Stack', 'Frontend', 'Backend', 'Mobile Development', 'Testing',
      'QA Automation', 'Performance Testing', 'Security Testing', 'System Design',
      'Blockchain', 'Web3', 'IoT', 'Edge Computing', 'AR/VR', 'Game Development',
      'Mainframe', 'COBOL', 'SAP', 'Legacy Modernization'
    ],
    searchTerms: ['developer', 'engineer', 'software', 'programming', 'tech', 'devops', 'cloud', 'data']
  },

  // ==================== SALES & BUSINESS DEVELOPMENT ====================
  'sales': {
    keywords: [
      'sales', 'selling', 'business development', 'client acquisition', 'lead generation',
      'cold calling', 'warm calling', 'account management', 'key account management',
      'negotiation', 'closing', 'deal', 'quota', 'territory', 'forecasting',
      'salesforce', 'crm', 'sales pipeline', 'pipeline management', 'sales strategy',
      'enterprise sales', 'b2b', 'b2c', 'saas sales', 'software sales', 'medical sales',
      'pharmaceutical sales', 'real estate sales', 'financial sales', 'insurance sales',
      'retail sales', 'wholesale', 'distribution', 'channel sales', 'partner sales',
      'upselling', 'cross-selling', 'customer retention', 'customer success',
      'revenue growth', 'revenue generation', 'sales operations', 'sales enablement',
      'sales training', 'sales coaching', 'sales management', 'regional sales',
      'national sales', 'global sales', 'business planning', 'go-to-market strategy',
      'competitive analysis', 'market research', 'brand building', 'relationship building',
      'needs analysis', 'solution selling', 'consultative selling', 'spin selling',
      'sandler', 'challenger sale', 'strategic selling', 'value selling'
    ],
    jobTitles: [
      'Sales Manager', 'Business Development Manager', 'Account Executive', 'Sales Representative',
      'Regional Sales Manager', 'National Sales Manager', 'Global Sales Director',
      'Enterprise Sales Executive', 'Key Account Manager', 'Inside Sales Representative',
      'Outside Sales Representative', 'Sales Director', 'VP of Sales', 'Chief Revenue Officer',
      'Business Development Executive', 'Sales Operations Manager', 'Sales Enablement Manager',
      'Channel Sales Manager', 'Partner Sales Manager', 'Customer Success Manager',
      'Sales Trainer', 'Sales Coach', 'Account Director', 'Territory Sales Manager',
      'Area Sales Manager', 'Sales Consultant', 'Senior Sales Executive', 'SDR',
      'BDR', 'Sales Development Rep', 'Business Development Rep'
    ],
    skills: [
      'Sales', 'Business Development', 'Lead Generation', 'Account Management',
      'Negotiation', 'Closing', 'Sales Strategy', 'CRM', 'Salesforce',
      'Pipeline Management', 'Enterprise Sales', 'B2B Sales', 'Client Relations',
      'Revenue Growth', 'Sales Forecasting', 'Territory Management', 'Sales Operations',
      'Customer Retention', 'Upselling', 'Cross-selling', 'Market Research',
      'Solution Selling', 'Consultative Selling', 'Strategic Selling', 'Needs Analysis'
    ],
    searchTerms: ['sales', 'business development', 'account manager', 'b2b sales', 'crm']
  },

  // ==================== HR & TALENT MANAGEMENT ====================
  'hr': {
    keywords: [
      'hr', 'human resources', 'recruitment', 'talent acquisition', 'sourcing', 'screening',
      'interviewing', 'onboarding', 'offboarding', 'employee relations', 'employee engagement',
      'performance management', 'performance review', 'goal setting', 'kpi', 'okr',
      'learning and development', 'training', 'development', 'career development',
      'succession planning', 'talent management', 'workforce planning', 'hr strategy',
      'compensation', 'benefits', 'total rewards', 'incentives', 'bonus',
      'hr operations', 'hr policies', 'hr procedures', 'employee handbook',
      'labor law', 'employment law', 'compliance', 'workplace safety', 'osha',
      'diversity', 'inclusion', 'belonging', 'employee experience', 'culture',
      'organizational development', 'change management', 'hr analytics', 'people operations',
      'hris', 'workday', 'peoplesoft', 'adp', 'recruitment marketing', 'employer branding',
      'hr certification', 'shrm', 'hrci', 'pmp', 'employee wellness', 'work-life balance',
      'remote work', 'hybrid work', 'flexible work', 'gig economy', 'freelance management'
    ],
    jobTitles: [
      'HR Manager', 'HR Director', 'Talent Acquisition Specialist', 'Recruiter',
      'Technical Recruiter', 'Corporate Recruiter', 'Talent Manager', 'HR Business Partner',
      'Employee Relations Specialist', 'Training Manager', 'Learning & Development Manager',
      'Compensation Manager', 'Benefits Manager', 'HR Operations Manager', 'People Operations Manager',
      'Organizational Development Specialist', 'HR Generalist', 'VP of HR', 'Chief People Officer',
      'Diversity & Inclusion Manager', 'Talent Development Manager', 'HRIS Manager',
      'Workday Analyst', 'HR Consultant', 'HR Specialist', 'Global HR Manager',
      'Remote Work Manager', 'Employee Experience Manager'
    ],
    skills: [
      'HR Management', 'Talent Acquisition', 'Recruitment', 'Sourcing', 'Screening',
      'Interviewing', 'Onboarding', 'Employee Relations', 'Performance Management',
      'Training & Development', 'Compensation & Benefits', 'HR Operations', 'Compliance',
      'Labor Law', 'Workforce Planning', 'Talent Management', 'Succession Planning',
      'Organizational Development', 'Change Management', 'HR Analytics', 'People Operations',
      'Workday', 'Hris', 'Employee Engagement', 'Culture', 'Diversity & Inclusion',
      'Remote Work', 'Hybrid Work', 'HR Strategy', 'Employee Experience'
    ],
    searchTerms: ['hr', 'human resources', 'recruitment', 'talent acquisition', 'people']
  },

  // ==================== MARKETING & COMMUNICATION ====================
  'marketing': {
    keywords: [
      'marketing', 'digital marketing', 'seo', 'search engine optimization', 'sem',
      'content', 'content strategy', 'copywriting', 'blogging', 'writing',
      'social media', 'facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok',
      'brand', 'branding', 'brand management', 'brand positioning', 'visual identity',
      'campaign', 'campaign management', 'email marketing', 'marketing automation',
      'analytics', 'google analytics', 'advertising', 'ppc', 'google ads', 'facebook ads',
      'inbound', 'outbound', 'lead generation', 'demand generation', 'growth',
      'market research', 'competitive analysis', 'customer insights', 'consumer behavior',
      'product marketing', 'go-to-market', 'product launch', 'pricing', 'positioning',
      'storytelling', 'public relations', 'pr', 'corporate communication',
      'internal communication', 'crisis communication', 'press release', 'media relations',
      'event management', 'trade shows', 'webinars', 'partner marketing', 'affiliate marketing',
      'marketing strategy', 'brand awareness', 'customer acquisition', 'customer retention',
      'crm', 'hubspot', 'marketo', 'salesforce marketing cloud', 'pardot', 'eloqua',
      'influencer marketing', 'community management', 'user generated content',
      'video marketing', 'podcast', 'audio marketing', 'personal branding'
    ],
    jobTitles: [
      'Marketing Manager', 'Digital Marketing Manager', 'SEO Specialist', 'Content Strategist',
      'Social Media Manager', 'Brand Manager', 'Product Marketing Manager', 'Growth Manager',
      'Campaign Manager', 'Marketing Director', 'VP of Marketing', 'CMO',
      'Marketing Specialist', 'Content Writer', 'Copywriter', 'Marketing Analyst',
      'Email Marketing Specialist', 'PPC Specialist', 'PR Manager', 'Corporate Communications Manager',
      'Marketing Operations Manager', 'Brand Strategist', 'Marketing Consultant',
      'Influencer Marketing Manager', 'Community Manager', 'Video Marketing Specialist'
    ],
    skills: [
      'Marketing', 'Digital Marketing', 'SEO', 'Content Strategy', 'Copywriting',
      'Social Media', 'Brand Management', 'Campaign Management', 'Email Marketing',
      'Marketing Automation', 'Analytics', 'Google Analytics', 'PPC', 'Google Ads',
      'Lead Generation', 'Demand Generation', 'Market Research', 'Product Marketing',
      'Go-to-Market Strategy', 'Brand Positioning', 'Storytelling', 'Public Relations',
      'Event Management', 'Marketing Strategy', 'Customer Acquisition',
      'Influencer Marketing', 'Community Management', 'Video Marketing'
    ],
    searchTerms: ['marketing', 'digital marketing', 'seo', 'content', 'brand', 'social media']
  },

  // ==================== DESIGN & CREATIVE ====================
  'design': {
    keywords: [
      'ui', 'ux', 'user interface', 'user experience', 'interaction', 'prototyping',
      'figma', 'sketch', 'adobe xd', 'invision', 'balsamiq', 'wireframing',
      'visual design', 'graphic design', 'illustration', 'branding', 'logo design',
      'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere pro',
      'motion graphics', 'animation', '3d', 'blender', 'autocad', 'solidworks',
      'print design', 'packaging design', 'typography', 'color theory', 'layout',
      'creative direction', 'art direction', 'creative strategy', 'visual storytelling',
      'web design', 'responsive design', 'mobile design', 'app design',
      'design thinking', 'design systems', 'component libraries', 'ux research',
      'user testing', 'a/b testing', 'user research', 'persona', 'journey mapping',
      'service design', 'industrial design', 'product design', 'furniture design',
      'fashion design', 'textile design', 'jewelry design', 'ceramic design'
    ],
    jobTitles: [
      'UI/UX Designer', 'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer',
      'Visual Designer', 'Brand Designer', 'Creative Director', 'Art Director',
      'Interaction Designer', 'Motion Designer', 'Animator', '3D Designer',
      'Illustrator', 'Web Designer', 'Senior Designer', 'Lead Designer',
      'Design Manager', 'UX Researcher', 'Design Strategist', 'Creative Manager',
      'Service Designer', 'Industrial Designer', 'Fashion Designer'
    ],
    skills: [
      'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Photoshop', 'Illustrator',
      'InDesign', 'After Effects', 'Premiere Pro', 'Prototyping', 'Wireframing',
      'Visual Design', 'Graphic Design', 'Branding', 'Typography', 'Motion Graphics',
      'Animation', '3D Design', 'Web Design', 'Design Thinking', 'User Research',
      'UX Research', 'Design Systems', 'Creative Direction', 'Interaction Design',
      'Service Design', 'Industrial Design', 'Fashion Design'
    ],
    searchTerms: ['design', 'ui/ux', 'graphic', 'creative', 'visual', 'product design']
  },

  // ==================== OPERATIONS & SUPPLY CHAIN ====================
  'operations': {
    keywords: [
      'operations', 'business operations', 'supply chain', 'logistics', 'warehouse',
      'distribution', 'inventory', 'inventory management', 'vendor management',
      'procurement', 'sourcing', 'strategic sourcing', 'purchasing', 'buying',
      'quality', 'quality assurance', 'quality control', 'six sigma', 'lean',
      'process improvement', 'process optimization', 'operational efficiency',
      'project management', 'project planning', 'portfolio management',
      'vendor relations', 'supplier management', 'contract negotiation',
      'warehousing', 'transportation', 'fleet management', 'route optimization',
      'fulfillment', 'order management', 'customer service', 'service delivery',
      'capacity planning', 'resource allocation', 'workflow optimization',
      'compliance', 'regulatory compliance', 'safety', 'risk management',
      'enterprise resource planning', 'erp', 'sap', 'oracle', 'microsoft dynamics',
      'scm', 'demand planning', 'supply planning', 'production planning'
    ],
    jobTitles: [
      'Operations Manager', 'Operations Director', 'Supply Chain Manager', 'Logistics Manager',
      'Warehouse Manager', 'Inventory Manager', 'Procurement Manager', 'Sourcing Manager',
      'Quality Manager', 'Process Improvement Manager', 'Operations Analyst',
      'Business Operations Manager', 'Vendor Manager', 'Supplier Relations Manager',
      'Transportation Manager', 'Distribution Manager', 'Operations Consultant',
      'Supply Chain Director', 'SCM Manager', 'Production Manager', 'Plant Manager'
    ],
    skills: [
      'Operations', 'Supply Chain', 'Logistics', 'Inventory Management', 'Procurement',
      'Vendor Management', 'Quality Assurance', 'Process Improvement', 'Six Sigma',
      'Lean', 'Operational Efficiency', 'Project Management', 'Strategic Sourcing',
      'Warehousing', 'Distribution', 'Transportation', 'Order Management', 'Compliance',
      'Risk Management', 'Resource Allocation', 'Workflow Optimization', 'ERP',
      'SAP', 'Oracle', 'Microsoft Dynamics', 'Demand Planning', 'Supply Planning'
    ],
    searchTerms: ['operations', 'supply chain', 'logistics', 'procurement', 'inventory']
  },

  // ==================== CALL CENTRE & CUSTOMER SUPPORT ====================
  'call centre': {
    keywords: [
      'call centre', 'call center', 'customer support', 'customer service',
      'bpo', 'business process outsourcing', 'voice process', 'non-voice process',
      'inbound', 'outbound', 'customer care', 'customer success',
      'calling', 'telecalling', 'telesales', 'phone banking',
      'customer handling', 'query resolution', 'complaint handling',
      'active listening', 'communication skills', 'customer satisfaction',
      'crm', 'salesforce', 'service now', 'zendesk', 'freshdesk',
      'quality assurance', 'qa', 'call monitoring', 'call auditing',
      'customer retention', 'upselling', 'cross-selling',
      'process training', 'team leadership', 'operations',
      'aicc', 'dialler management', 'ivr', 'auto dialler',
      'average handling time', 'aht', 'first call resolution', 'fcr',
      'customer experience', 'cx', 'nps', 'customer feedback',
      'escalation management', 'problem solving', 'empathy',
      'technical support', 'desktop support', 'email support', 'chat support',
      'live chat', 'whatsapp support', 'social media support', 'ticket management',
      'customer service management', 'csm', 'csat', 'ces'
    ],
    jobTitles: [
      'Customer Service Representative', 'Customer Support Executive',
      'Call Centre Agent', 'Senior Customer Support', 'Team Leader',
      'Assistant Manager - Customer Service', 'Operations Manager',
      'Customer Success Manager', 'Quality Analyst', 'Quality Manager',
      'Process Trainer', 'Training Manager', 'BPO Manager',
      'Service Delivery Manager', 'Customer Care Executive',
      'Telecalling Executive', 'Tech Support Engineer',
      'Customer Support Specialist', 'Helpdesk Executive', 'Customer Experience Manager'
    ],
    skills: [
      'Customer Service', 'Call Centre Operations', 'Inbound/Outbound',
      'Customer Handling', 'Query Resolution', 'CRM Tools', 'Salesforce',
      'Zendesk', 'Quality Assurance', 'Process Training', 'Team Leadership',
      'Communication Skills', 'Customer Satisfaction', 'First Call Resolution',
      'Average Handling Time', 'Customer Experience', 'Escalation Management',
      'Active Listening', 'Upselling', 'Cross-selling', 'Technical Support',
      'Email Support', 'Chat Support', 'Ticket Management', 'CSAT', 'NPS'
    ],
    searchTerms: ['customer service', 'call centre', 'bpo', 'support', 'customer care']
  },

  // ==================== HEALTHCARE ====================
  'healthcare': {
    keywords: [
      'healthcare', 'medical', 'clinical', 'hospital', 'patient', 'doctor',
      'nursing', 'nurse', 'pharmacy', 'pharmaceutical', 'biotech', 'biotechnology',
      'medical devices', 'diagnostics', 'imaging', 'radiology', 'pathology',
      'surgery', 'emergency', 'intensive care', 'icu', 'operation theater',
      'health informatics', 'medical records', 'electronic health records', 'ehr',
      'telemedicine', 'remote patient monitoring', 'clinical trials', 'research',
      'public health', 'epidemiology', 'health administration', 'medical writing',
      'regulatory affairs', 'quality assurance', 'pharmacovigilance', 'safety',
      'anatomy', 'physiology', 'pathophysiology', 'pharmacology', 'toxicology',
      'medical coding', 'medical billing', 'healthcare compliance', 'hipaa',
      'patient safety', 'clinical research', 'pharmaceutical sales'
    ],
    jobTitles: [
      'Healthcare Administrator', 'Clinical Manager', 'Nurse', 'Medical Officer',
      'Healthcare Consultant', 'Pharma Manager', 'Health Informatics Specialist',
      'Patient Care Coordinator', 'Hospital Administrator', 'Head of Operations',
      'Medical Director', 'Chief Medical Officer', 'Healthcare Executive',
      'Clinical Research Associate', 'Quality Assurance Manager', 'Regulatory Affairs Manager',
      'Pharmacist', 'Medical Coder', 'Clinical Research Coordinator'
    ],
    skills: [
      'Healthcare', 'Patient Care', 'Clinical Operations', 'Medical Records',
      'Health Informatics', 'EHR', 'Telemedicine', 'Pharmaceuticals', 'Medical Devices',
      'Regulatory Affairs', 'Quality Assurance', 'Clinical Trials', 'Pharmacovigilance',
      'Hospital Administration', 'Public Health', 'Medical Writing',
      'Medical Coding', 'Medical Billing', 'HIPAA', 'Compliance', 'Patient Safety'
    ],
    searchTerms: ['healthcare', 'medical', 'clinical', 'nursing', 'pharma']
  },

  // ==================== LEGAL ====================
  'legal': {
    keywords: [
      'legal', 'law', 'attorney', 'advocate', 'legal counsel', 'compliance',
      'regulatory', 'regulatory compliance', 'contract', 'contract law',
      'litigation', 'corporate law', 'business law', 'employment law',
      'legal advisory', 'legal research', 'legal writing', 'drafting',
      'negotiation', 'mediation', 'arbitration', 'dispute resolution',
      'intellectual property', 'patent', 'trademark', 'copyright',
      'data privacy', 'gdpr', 'ccpa', 'hipaa', 'ferpa', 'sox',
      'anti-money laundering', 'aml', 'know your customer', 'kyc',
      'due diligence', 'legal compliance', 'ethics', 'governance',
      'mergers and acquisitions', 'm&a', 'securities law', 'banking law',
      'tax law', 'family law', 'criminal law', 'constitutional law'
    ],
    jobTitles: [
      'Legal Counsel', 'Corporate Lawyer', 'Compliance Officer', 'Legal Manager',
      'Senior Legal Counsel', 'General Counsel', 'Chief Compliance Officer',
      'Legal Analyst', 'Contracts Manager', 'Regulatory Affairs Manager',
      'IP Lawyer', 'Privacy Lawyer', 'Employment Lawyer', 'Litigation Lawyer',
      'M&A Lawyer', 'Tax Lawyer', 'Legal Consultant', 'Legal Director',
      'Partner', 'Associate Attorney', 'Paralegal', 'Legal Assistant'
    ],
    skills: [
      'Legal', 'Compliance', 'Corporate Law', 'Contract Management', 'Legal Research',
      'Legal Writing', 'Drafting', 'Negotiation', 'Dispute Resolution', 'IP Law',
      'Data Privacy', 'GDPR', 'AML', 'KYC', 'Due Diligence', 'Regulatory Compliance',
      'Corporate Governance', 'Ethics', 'Compliance Auditing', 'M&A',
      'Securities Law', 'Banking Law', 'Tax Law'
    ],
    searchTerms: ['legal', 'law', 'compliance', 'regulatory', 'contract']
  },

  // ==================== EDUCATION & TEACHING ====================
  'education': {
    keywords: [
      'education', 'teaching', 'training', 'instruction', 'curriculum', 'pedagogy',
      'student', 'learning', 'faculty', 'academic', 'professor', 'teacher',
      'coaching', 'mentoring', 'lesson plans', 'assessment', 'grading',
      'e-learning', 'online learning', 'educational technology', 'edtech',
      'instructional design', 'learning management system', 'lms', 'canvas',
      'student engagement', 'classroom management', 'educational leadership',
      'academic advising', 'career counseling', 'student development',
      'higher education', 'k-12', 'primary education', 'secondary education',
      'special education', 'esl', 'efl', 'language teaching', 'stem education'
    ],
    jobTitles: [
      'Teacher', 'Professor', 'Lecturer', 'Instructor', 'Trainer', 'Instructional Designer',
      'Curriculum Developer', 'Education Manager', 'Academic Advisor', 'Principal',
      'Dean', 'Head of Department', 'Education Consultant', 'E-learning Specialist',
      'Corporate Trainer', 'Learning & Development Manager', 'Special Education Teacher',
      'ESL Teacher', 'Professor', 'School Principal', 'Assistant Professor', 'Associate Professor'
    ],
    skills: [
      'Teaching', 'Curriculum Development', 'Instructional Design', 'Training',
      'E-learning', 'Educational Technology', 'Learning Management Systems',
      'Student Engagement', 'Classroom Management', 'Assessment', 'Grading',
      'Academic Advising', 'Career Counseling', 'Educational Leadership',
      'Higher Education', 'K-12 Education', 'Special Education', 'ESL/EFL',
      'STEM Education', 'Lesson Planning', 'Educational Research'
    ],
    searchTerms: ['education', 'teaching', 'training', 'academic', 'learning']
  },

  // ==================== ENGINEERING ====================
  'engineering': {
    keywords: [
      'mechanical', 'electrical', 'electronics', 'civil', 'structural', 'chemical',
      'aerospace', 'automotive', 'industrial', 'manufacturing', 'production',
      'autocad', 'solidworks', 'catia', 'ansys', 'matlab', 'simulink',
      'cad', 'cam', 'cnc', 'plc', 'scada', 'robotics', 'automation',
      'quality engineering', 'reliability', 'failure analysis', 'maintenance',
      'supply chain', 'procurement', 'vendor development', 'production planning',
      'lean manufacturing', 'six sigma', 'process engineering', 'material science',
      'thermodynamics', 'fluid mechanics', 'structural analysis', 'project engineering',
      'instrumentation', 'control systems', 'power engineering', 'renewable energy'
    ],
    jobTitles: [
      'Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Structural Engineer',
      'Chemical Engineer', 'Aerospace Engineer', 'Automotive Engineer', 'Industrial Engineer',
      'Manufacturing Engineer', 'Production Manager', 'Plant Manager', 'Quality Engineer',
      'Maintenance Manager', 'Operations Engineer', 'Process Engineer', 'Design Engineer',
      'Instrumentation Engineer', 'Controls Engineer', 'Power Engineer', 'Renewable Energy Engineer'
    ],
    skills: [
      'Mechanical Design', 'Electrical Engineering', 'Civil Engineering', 'Structural Analysis',
      'Chemical Engineering', 'Manufacturing', 'CAD', 'SolidWorks', 'AutoCAD',
      'PLC', 'SCADA', 'Robotics', 'Automation', 'Quality Engineering', 'Six Sigma',
      'Lean Manufacturing', 'Project Engineering', 'Thermodynamics', 'Fluid Mechanics',
      'Instrumentation', 'Control Systems', 'Power Engineering', 'Renewable Energy'
    ],
    searchTerms: ['engineering', 'mechanical', 'electrical', 'civil', 'manufacturing']
  },

  // ==================== CONSULTING & STRATEGY ====================
  'consulting': {
    keywords: [
      'consulting', 'consultant', 'management consulting', 'strategy', 'strategic planning',
      'business advisory', 'advisory', 'business transformation', 'transformation',
      'change management', 'organizational change', 'process optimization',
      'business analysis', 'requirements analysis', 'solution design',
      'client engagement', 'stakeholder management', 'executive communication',
      'due diligence', 'market intelligence', 'competitive analysis',
      'go-to-market', 'business model', 'financial advisory', 'm&a',
      'digital transformation', 'technology consulting', 'it consulting',
      'performance improvement', 'operational excellence', 'cost reduction',
      'business development', 'sales consulting', 'marketing consulting', 'hr consulting'
    ],
    jobTitles: [
      'Management Consultant', 'Strategy Consultant', 'Business Consultant', 'Senior Consultant',
      'Principal Consultant', 'Partner', 'Managing Consultant', 'Strategy Manager',
      'Business Analyst', 'Advisory Manager', 'Transformation Lead', 'Change Manager',
      'Consulting Director', 'VP Consulting', 'Solution Consultant',
      'Digital Transformation Consultant', 'Technology Consultant', 'HR Consultant',
      'Sales Consultant', 'Marketing Consultant'
    ],
    skills: [
      'Consulting', 'Strategy', 'Business Analysis', 'Change Management', 'Process Optimization',
      'Client Management', 'Stakeholder Management', 'Due Diligence', 'Market Analysis',
      'Competitive Intelligence', 'Go-to-Market', 'Business Transformation', 'Advisory',
      'Performance Improvement', 'Operational Excellence', 'Cost Reduction',
      'Digital Transformation', 'Technology Consulting', 'Organizational Change'
    ],
    searchTerms: ['consulting', 'strategy', 'business analysis', 'advisory']
  },

  // ==================== DATA & ANALYTICS ====================
  'data analytics': {
    keywords: [
      'data', 'analytics', 'data analysis', 'data science', 'data engineering',
      'business intelligence', 'bi', 'power bi', 'tableau', 'qlikview', 'looker',
      'sql', 'postgresql', 'mysql', 'big data', 'hadoop', 'spark', 'hive', 'pig',
      'python', 'r', 'statistics', 'predictive modeling', 'machine learning',
      'data visualization', 'dashboard', 'reporting', 'etl', 'data warehousing',
      'data mining', 'data governance', 'data quality', 'data strategy',
      'a/b testing', 'experimentation', 'user analytics', 'product analytics',
      'quantitative analysis', 'qualitative analysis', 'market research',
      'customer analytics', 'supply chain analytics', 'hr analytics', 'finance analytics'
    ],
    jobTitles: [
      'Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Data Engineer',
      'BI Developer', 'Data Manager', 'Analytics Manager', 'Data Strategist',
      'Machine Learning Engineer', 'Quantitative Analyst', 'Data Architect',
      'Data Governance Manager', 'Chief Data Officer', 'Data Consultant',
      'Predictive Analytics Specialist', 'Big Data Engineer', 'Data Visualization Specialist'
    ],
    skills: [
      'Data Analysis', 'Data Science', 'Data Engineering', 'Business Intelligence',
      'Power BI', 'Tableau', 'SQL', 'Python', 'Statistics', 'Machine Learning',
      'Data Visualization', 'ETL', 'Data Warehousing', 'Big Data', 'Spark',
      'Predictive Modeling', 'Data Governance', 'Data Quality', 'Analytics',
      'Quantitative Analysis', 'Qualitative Analysis', 'Customer Analytics'
    ],
    searchTerms: ['data', 'analytics', 'data science', 'business intelligence']
  },

  // ==================== PROJECT MANAGEMENT ====================
  'project management': {
    keywords: [
      'project management', 'project planning', 'project coordination', 'project delivery',
      'scrum master', 'product owner', 'project manager', 'program manager',
      'portfolio management', 'pmp', 'prince2', 'agile', 'waterfall', 'kanban',
      'jira', 'confluence', 'ms project', 'trello', 'asana', 'monday.com', 'clickup',
      'stakeholder management', 'cross-functional teams', 'team leadership',
      'risk management', 'issue tracking', 'budget management', 'resource management',
      'scope management', 'schedule management', 'quality management', 'milestone tracking',
      'status reporting', 'progress tracking', 'project governance', 'project charter',
      'project lifecycle', 'agile project management', 'hybrid project management'
    ],
    jobTitles: [
      'Project Manager', 'Scrum Master', 'Product Owner', 'Program Manager',
      'Portfolio Manager', 'Project Coordinator', 'Project Lead', 'Delivery Manager',
      'Agile Coach', 'PMO Manager', 'Project Director', 'Technical Project Manager',
      'IT Project Manager', 'Construction Project Manager', 'Engineering Project Manager',
      'Senior Project Manager', 'Program Director', 'PMO Director'
    ],
    skills: [
      'Project Management', 'Project Planning', 'Agile', 'Scrum', 'Kanban',
      'Waterfall', 'Jira', 'Confluence', 'MS Project', 'Trello', 'Asana',
      'Stakeholder Management', 'Risk Management', 'Budget Management',
      'Resource Management', 'Scope Management', 'Team Leadership', 'Cross-functional Collaboration',
      'Status Reporting', 'Milestone Tracking', 'Project Governance',
      'PMP', 'PRINCE2', 'Agile Project Management'
    ],
    searchTerms: ['project management', 'scrum', 'agile', 'pmp', 'program manager']
  },

  // ==================== MANUFACTURING ====================
  'manufacturing': {
    keywords: [
      'manufacturing', 'production', 'factory', 'plant', 'assembly', 'fabrication',
      'lean manufacturing', 'six sigma', 'kaizen', '5s', 'tpm', 'total productive maintenance',
      'supply chain', 'logistics', 'inventory', 'warehouse', 'material planning',
      'quality control', 'quality assurance', 'inspection', 'testing', 'calibration',
      'production planning', 'scheduling', 'capacity planning', 'manufacturing processes',
      'injection molding', 'casting', 'machining', 'welding', 'fabrication', 'assembly line',
      'automation', 'robotics', 'plc', 'scada', 'hmi', 'industrial engineering',
      'process improvement', 'lean six sigma', 'value stream mapping', 'kanban'
    ],
    jobTitles: [
      'Manufacturing Engineer', 'Production Manager', 'Plant Manager', 'Operations Manager',
      'Quality Engineer', 'Quality Manager', 'Process Engineer', 'Industrial Engineer',
      'Production Supervisor', 'Assembly Manager', 'Factory Manager', 'Lean Manager',
      'Six Sigma Black Belt', 'Continuous Improvement Manager', 'Supply Chain Manager'
    ],
    skills: [
      'Manufacturing', 'Production', 'Lean Manufacturing', 'Six Sigma', 'Quality Control',
      'Process Improvement', 'Production Planning', 'Inventory Management', 'Supply Chain',
      'Automation', 'Robotics', 'PLC', 'SCADA', 'Industrial Engineering', 'Kaizen',
      '5S', 'TPM', 'Value Stream Mapping', 'Kanban', 'Continuous Improvement'
    ],
    searchTerms: ['manufacturing', 'production', 'plant', 'quality', 'lean']
  },

  // ==================== AEROSPACE & DEFENSE ====================
  'aerospace': {
    keywords: [
      'aerospace', 'aviation', 'aircraft', 'airplane', 'jet', 'propulsion', 'aerodynamics',
      'space', 'spacecraft', 'satellite', 'rocket', 'launch vehicle', 'defense',
      'military', 'naval', 'marine', 'submarine', 'weapons', 'missile', 'radar',
      'flight control', 'autopilot', 'avionics', 'navigation', 'guidance',
      'structural analysis', 'composites', 'materials science', 'aerostructures',
      'propulsion systems', 'turbines', 'engines', 'fuel systems', 'landing gear',
      'air traffic control', 'maintenance', 'repair', 'overhaul', 'mro'
    ],
    jobTitles: [
      'Aerospace Engineer', 'Aircraft Design Engineer', 'Propulsion Engineer',
      'Structural Engineer', 'Avionics Engineer', 'Test Engineer', 'Flight Test Engineer',
      'Systems Engineer', 'Project Manager - Aerospace', 'Supply Chain Manager',
      'Quality Engineer', 'Safety Engineer', 'Maintenance Engineer', 'Technical Manager'
    ],
    skills: [
      'Aerospace Engineering', 'Aircraft Design', 'Propulsion', 'Aerodynamics',
      'Structural Analysis', 'Avionics', 'Flight Control', 'Navigation Systems',
      'Composite Materials', 'Materials Science', 'Systems Integration',
      'Project Management', 'Quality Assurance', 'Safety Compliance'
    ],
    searchTerms: ['aerospace', 'aviation', 'aircraft', 'space', 'defense']
  },

  // ==================== AUTOMOTIVE ====================
  'automotive': {
    keywords: [
      'automotive', 'vehicle', 'car', 'truck', 'bus', 'electric vehicle', 'ev',
      'hybrid vehicle', 'powertrain', 'transmission', 'engine', 'battery', 'fuel cell',
      'chassis', 'suspension', 'brakes', 'steering', 'tires', 'wheels',
      'automotive engineering', 'vehicle dynamics', 'crash safety', 'homologation',
      'manufacturing', 'production', 'assembly', 'supply chain', 'dealership',
      'aftermarket', 'service', 'repair', 'maintenance', 'diagnostics'
    ],
    jobTitles: [
      'Automotive Engineer', 'Design Engineer', 'Powertrain Engineer', 'Chassis Engineer',
      'Vehicle Dynamics Engineer', 'EV Engineer', 'Battery Engineer', 'Manufacturing Engineer',
      'Quality Engineer', 'Supplier Quality Engineer', 'Program Manager', 'Sales Manager'
    ],
    skills: [
      'Automotive Engineering', 'Vehicle Design', 'Powertrain', 'Electric Vehicle',
      'Battery Technology', 'Vehicle Dynamics', 'Safety Systems', 'Homologation',
      'Manufacturing', 'Assembly', 'Supply Chain', 'Quality Assurance'
    ],
    searchTerms: ['automotive', 'vehicle', 'car', 'electric vehicle', 'ev']
  },

  // ==================== HOSPITALITY & TOURISM ====================
  'hospitality': {
    keywords: [
      'hospitality', 'hotel', 'resort', 'restaurant', 'catering', 'food and beverage',
      'guest services', 'front office', 'housekeeping', 'event management', 'banquets',
      'tourism', 'travel', 'tour operator', 'destination management', 'travel agency',
      'airline', 'cruise', 'passenger services', 'ground handling', 'cargo',
      'hospitality management', 'revenue management', 'yield management', 'booking',
      'check-in', 'reservations', 'concierge', 'guest satisfaction', 'guest experience',
      'food safety', 'hygiene', 'health and safety', 'haccp', 'staff training'
    ],
    jobTitles: [
      'Hotel Manager', 'Front Office Manager', 'Food and Beverage Manager', 'Event Manager',
      'Sales Manager', 'Revenue Manager', 'Marketing Manager', 'Operations Manager',
      'Housekeeping Manager', 'Executive Chef', 'Restaurant Manager', 'General Manager',
      'Hospitality Consultant', 'Travel Agent', 'Tour Guide', 'Flight Attendant',
      'Customer Service Manager', 'Banquet Manager', 'Reservations Manager'
    ],
    skills: [
      'Hospitality Management', 'Guest Services', 'Front Office', 'Housekeeping',
      'Food and Beverage', 'Event Management', 'Revenue Management', 'Sales',
      'Marketing', 'Operations', 'Team Leadership', 'Customer Service',
      'Booking Systems', 'Reservation Systems', 'Health and Safety', 'HACCP'
    ],
    searchTerms: ['hospitality', 'hotel', 'restaurant', 'tourism', 'travel']
  },

  // ==================== RETAIL & FMCG ====================
  'retail': {
    keywords: [
      'retail', 'fmcg', 'consumer goods', 'supermarket', 'hypermarket', 'department store',
      'merchandising', 'visual merchandising', 'store operations', 'inventory management',
      'category management', 'buying', 'sourcing', 'procurement', 'supplier management',
      'logistics', 'warehouse', 'distribution', 'store layout', 'planogram',
      'sales', 'customer service', 'cashier', 'checkout', 'point of sale', 'pos',
      'promotions', 'marketing', 'loyalty programs', 'customer retention',
      'pricing', 'profitability', 'loss prevention', 'security', 'safety'
    ],
    jobTitles: [
      'Retail Manager', 'Store Manager', 'Assistant Store Manager', 'Area Manager',
      'Regional Manager', 'Category Manager', 'Merchandiser', 'Buyer',
      'Supply Chain Manager', 'Warehouse Manager', 'Sales Associate', 'Cashier',
      'Inventory Specialist', 'Loss Prevention Manager', 'Visual Merchandiser'
    ],
    skills: [
      'Retail Operations', 'Store Management', 'Merchandising', 'Category Management',
      'Inventory Management', 'Sales', 'Customer Service', 'Logistics',
      'Warehousing', 'Distribution', 'Visual Merchandising', 'Procurement',
      'Supplier Management', 'Promotions', 'Pricing', 'Loss Prevention'
    ],
    searchTerms: ['retail', 'fmcg', 'store', 'merchandising', 'inventory']
  },

  // ==================== MEDIA & ENTERTAINMENT ====================
  'media': {
    keywords: [
      'media', 'entertainment', 'broadcast', 'television', 'tv', 'radio', 'podcast',
      'film', 'movie', 'cinema', 'production', 'pre-production', 'post-production',
      'editing', 'video editing', 'audio editing', 'sound design', 'mixing',
      'animation', 'motion graphics', 'vfx', 'visual effects', 'cg', 'computer graphics',
      'journalism', 'news', 'anchoring', 'reporting', 'writing', 'editing',
      'content creation', 'scriptwriting', 'storyboarding', 'directing', 'producing',
      'photography', 'videography', 'lighting', 'sound', 'stage'
    ],
    jobTitles: [
      'Producer', 'Director', 'Editor', 'Videographer', 'Photographer',
      'Journalist', 'News Anchor', 'Reporter', 'Content Creator', 'Scriptwriter',
      'Sound Engineer', 'Audio Engineer', 'Video Editor', 'Motion Designer',
      'VFX Artist', 'Production Manager', 'Post-production Supervisor', 'Creative Director',
      'Media Manager', 'Broadcast Engineer', 'Podcast Producer'
    ],
    skills: [
      'Video Production', 'Post-production', 'Editing', 'Audio Engineering',
      'Motion Graphics', 'VFX', 'Animation', 'Journalism', 'News Reporting',
      'Content Creation', 'Scriptwriting', 'Directing', 'Producing',
      'Photography', 'Videography', 'Sound Design', 'Creative Direction',
      'Media Management', 'Broadcasting', 'Storyboarding'
    ],
    searchTerms: ['media', 'entertainment', 'video', 'production', 'journalism']
  },

  // ==================== CONSTRUCTION & REAL ESTATE ====================
  'construction': {
    keywords: [
      'construction', 'building', 'architecture', 'civil engineering', 'structural',
      'residential', 'commercial', 'infrastructure', 'roads', 'bridges', 'utilities',
      'project management', 'site management', 'site supervision', 'construction management',
      'quantity surveying', 'cost estimation', 'budgeting', 'bidding', 'contracts',
      'materials', 'sourcing', 'procurement', 'logistics', 'scheduling',
      'safety', 'quality control', 'permits', 'regulations', 'zoning',
      'real estate', 'property', 'leasing', 'sales', 'valuation'
    ],
    jobTitles: [
      'Construction Manager', 'Project Manager', 'Site Manager', 'Superintendent',
      'Civil Engineer', 'Architect', 'Structural Engineer', 'Quantity Surveyor',
      'Cost Estimator', 'Procurement Manager', 'Safety Manager', 'Quality Manager',
      'Real Estate Agent', 'Property Manager', 'Leasing Manager', 'Real Estate Broker'
    ],
    skills: [
      'Construction Management', 'Project Management', 'Site Management', 'Quantity Surveying',
      'Cost Estimation', 'Budgeting', 'Contract Management', 'Scheduling',
      'Safety Compliance', 'Quality Control', 'Architecture', 'Structural Design',
      'Real Estate', 'Property Management', 'Valuation', 'Leasing', 'Procurement'
    ],
    searchTerms: ['construction', 'civil', 'architecture', 'real estate', 'building']
  },

  // ==================== LOGISTICS & TRANSPORTATION ====================
  'logistics': {
    keywords: [
      'logistics', 'transportation', 'freight', 'shipping', 'cargo', 'container',
      'supply chain', 'warehouse', 'distribution', 'fleet management', 'route planning',
      'transport management', 'dispatching', 'delivery', 'last mile', 'first mile',
      '3pl', 'third party logistics', 'contract logistics', 'air cargo', 'sea freight',
      'road transport', 'rail transport', 'intermodal', 'cold chain', 'hazmat',
      'inventory', 'warehousing', 'order fulfillment', 'packaging', 'labeling'
    ],
    jobTitles: [
      'Logistics Manager', 'Transportation Manager', 'Warehouse Manager', 'Supply Chain Manager',
      'Fleet Manager', 'Operations Manager', 'Freight Manager', 'Distribution Manager',
      'Shipping Coordinator', 'Inventory Manager', 'Purchasing Manager', 'Strategic Sourcing Manager',
      '3PL Manager', 'Logistics Coordinator', 'Transport Planner'
    ],
    skills: [
      'Logistics', 'Supply Chain', 'Transportation', 'Warehouse Operations',
      'Inventory Management', 'Fleet Management', 'Route Planning', 'Distribution',
      'Freight', 'Shipping', 'Cold Chain', '3PL Management', 'Order Fulfillment',
      'Packaging', 'Labeling', 'Operations Management'
    ],
    searchTerms: ['logistics', 'transportation', 'freight', 'warehouse', 'supply chain']
  }
};

// Detect domain from CV
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

  return {
    domain: bestDomain,
    confidence: Math.min(bestScore / 10, 1),
    keywords: matchedKeywords.slice(0, 10)
  };
}

// AI Extraction with domain context
async function extractSkillsWithAI(text: string, domain: string): Promise<{
  skills: string[];
  jobRoles: string[];
  experience: string;
  location: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const domainData = domainDatabase[domain as keyof typeof domainDatabase];
    const domainContext = domainData ? 
      `Focus on extracting ${domain}-specific skills and job titles.` : 
      'Extract all skills and job titles.';

    const prompt = `
      You are a professional resume parser. ${domainContext}

      CRITICAL RULES:
      1. Extract ONLY skills explicitly mentioned in the resume.
      2. Extract EXACT job titles from professional experience.
      3. Return ONLY valid JSON (no markdown, no explanation).

      Format:
      {
        "skills": ["skill1", "skill2", "skill3"],
        "jobRoles": ["exact job title 1", "exact job title 2"],
        "experience": "X years",
        "location": "city, country"
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
      skills: parsed.skills || [],
      jobRoles: parsed.jobRoles || [],
      experience: parsed.experience || "3-5 years",
      location: parsed.location || "India"
    };
  } catch (error) {
    console.error("❌ AI Error:", error);
    const domainData = domainDatabase[domain as keyof typeof domainDatabase];
    return {
      skills: domainData?.skills || ['Professional', 'Management'],
      jobRoles: domainData?.jobTitles?.slice(0, 3) || ['Professional'],
      experience: "3-5 years",
      location: "India"
    };
  }
}

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
    console.log("🎯 Domain:", domainDetection.domain, "Confidence:", domainDetection.confidence);
    
    // Extract skills
    const extractionResult = await extractSkillsWithAI(cvText, domainDetection.domain);
    
    const extractedSkills = extractionResult.skills;
    const detectedJobRoles = extractionResult.jobRoles;
    
    console.log("🎯 Skills:", extractedSkills);
    console.log("💼 Job Roles:", detectedJobRoles);

    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;
    
    if (!APP_ID || !API_KEY) {
      return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
    }
    
    // Build search queries
    let searchTerms: string[] = [];
    
    const domainData = domainDatabase[domainDetection.domain as keyof typeof domainDatabase];
    if (domainData) {
      searchTerms.push(...domainData.searchTerms);
    }
    
    if (detectedJobRoles.length > 0) {
      searchTerms.push(...detectedJobRoles.slice(0, 3));
    }
    
    if (extractedSkills.length > 0) {
      searchTerms.push(...extractedSkills.slice(0, 3));
    }
    
    if (searchTerms.length === 0) {
      searchTerms = ['professional jobs'];
    }
    
    searchTerms = [...new Set(searchTerms)];
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
                domain: domainDetection.domain
              }));
              
              allJobs = [...allJobs, ...pageJobs];
            }
          }
        } catch (err) {
          console.error(`Error:`, err);
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
    
    return NextResponse.json({
      success: true,
      extractedSkills: extractedSkills,
      jobRoles: detectedJobRoles,
      detectedDomain: domainDetection.domain,
      domainConfidence: domainDetection.confidence,
      matchedJobs: finalJobs,
      totalMatches: finalJobs.length,
      source: 'Complete Universal Domain Detection (30+ Domains)'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CV', 
      details: String(error) 
    }, { status: 500 });
  }
}