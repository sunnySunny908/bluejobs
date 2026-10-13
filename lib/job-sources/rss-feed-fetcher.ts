import Parser from 'rss-parser';

const parser = new Parser();

// Free RSS feeds - No API Key, No Limits
const RSS_FEEDS = [
  'https://www.indeed.com/rss?q=software+engineer&l=India',
  'https://www.indeed.com/rss?q=data+scientist&l=India',
  'https://www.indeed.com/rss?q=product+manager&l=India',
  'https://www.indeed.com/rss?q=ux+designer&l=India',
  'https://remoteok.com/remote-jobs.rss', // Remote jobs
  'https://weworkremotely.com/remote-jobs.rss' // More remote jobs
];

export interface RSSJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate: string;
  source: 'RSS';
}

export async function fetchRSSJobs(keywords: string[], location: string): Promise<RSSJob[]> {
  const allJobs: RSSJob[] = [];
  
  try {
    // CV ke keywords se custom RSS URLs banao
    const customFeeds = keywords.slice(0, 4).map(keyword => 
      `https://www.indeed.com/rss?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location || 'India')}`
    );
    
    const feedsToFetch = [...RSS_FEEDS, ...customFeeds];
    
    const fetchPromises = feedsToFetch.map(async (feedUrl) => {
      try {
        const feed = await parser.parseURL(feedUrl);
        return feed.items.slice(0, 15); // Har feed se top 15 jobs
      } catch (error) {
        return [];
      }
    });
    
    const results = await Promise.all(fetchPromises);
    
    results.forEach((items, idx) => {
      items.forEach((item, itemIdx) => {
        const title = item.title || 'Unknown';
        const parts = title.split(' - ');
        
        allJobs.push({
          id: `rss-${idx}-${itemIdx}-${Date.now()}`,
          title: parts[0] || title,
          company: parts.length > 1 ? parts[1] : 'Unknown',
          location: parts.length > 2 ? parts[2] : (location || 'India'),
          description: item.contentSnippet || item.content || '',
          url: item.link || '',
          postedDate: item.pubDate || new Date().toISOString(),
          source: 'RSS'
        });
      });
    });
    
  } catch (error) {
    console.error('RSS fetch error:', error);
  }
  
  return allJobs;
}