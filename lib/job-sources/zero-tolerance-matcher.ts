export interface CVProfile {
  skills: string[];
  title: string;
  summary: string;
}

export interface MatchedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchingSkills: string[];
  relevanceScore: number;
  source: string;
}

// ZERO TOLERANCE: Sirf 75%+ score wale jobs hi pass honge
const MIN_RELEVANCE_THRESHOLD = 75;

export function matchJobsToCV(jobs: any[], cvProfile: CVProfile): MatchedJob[] {
  const matched: MatchedJob[] = [];
  
  const cvSkillsLower = cvProfile.skills.map(s => s.toLowerCase());
  const cvTitleLower = cvProfile.title.toLowerCase();
  
  jobs.forEach(job => {
    const jobTitleLower = (job.title || '').toLowerCase();
    const jobDescLower = (job.description || '').toLowerCase();
    
    // 1. Skill Match Check
    const matchingSkills: string[] = [];
    cvSkillsLower.forEach(skill => {
      if (jobTitleLower.includes(skill) || jobDescLower.includes(skill)) {
        matchingSkills.push(skill);
      }
    });
    
    // 2. Relevance Score Calculate karo
    let score = 0;
    
    // Skill Match (70% weight) - Sabse important
    const skillMatchRatio = cvSkillsLower.length > 0 
      ? matchingSkills.length / cvSkillsLower.length 
      : 0;
    score += skillMatchRatio * 70;
    
    // Title Match (30% weight)
    const titleWords = cvTitleLower.split(/\s+/).filter(w => w.length > 3);
    const titleMatches = titleWords.filter(w => jobTitleLower.includes(w)).length;
    const titleScore = titleWords.length > 0 ? titleMatches / titleWords.length : 0;
    score += titleScore * 30;
    
    // ZERO TOLERANCE CHECK: Agar score 75 se kam hai, toh job discard
    if (score >= MIN_RELEVANCE_THRESHOLD && matchingSkills.length >= 2) {
      matched.push({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description?.substring(0, 300) || '',
        url: job.url,
        matchingSkills: matchingSkills,
        relevanceScore: Math.round(score),
        source: job.source || 'Unknown'
      });
    }
  });
  
  // Highest score pehle dikhao
  return matched.sort((a, b) => b.relevanceScore - a.relevanceScore);
}