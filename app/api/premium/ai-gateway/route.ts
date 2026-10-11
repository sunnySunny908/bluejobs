import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// AI Provider Configs
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// ==================== PROMPT GENERATOR ====================
function getPromptForFeature(feature: string, cvText: string, jobDesc?: string): string {
  const baseContext = `CV Text:\n${cvText.substring(0, 4000)}\n\n`;
  
  switch (feature) {
    case 'resume_rewrite':
      return `${baseContext}You are an expert resume writer. Rewrite the experience bullet points to be ATS-optimized, action-oriented, and quantifiable. Use the XYZ formula. Return ONLY a JSON array of strings.`;
    case 'missing_skills':
      return `${baseContext}Job Description:\n${jobDesc || 'General Tech Role'}\n\nYou are a career coach. Analyze the CV against the Job Description. Return a JSON object with: { "missing_skills": [], "recommended_courses": [{"title": "Course Name", "platform": "Udemy", "url": "https://..."}], "salary_impact": "+30-40%" }.`;
    case 'career_roadmap':
      return `${baseContext}You are a career strategist. Create a detailed 30-60-90 day skill development plan. Return a JSON object with: { "day_30": [], "day_60": [], "day_90": [], "long_term_goal": "string" }.`;
    case 'interview_prep':
      return `${baseContext}You are a technical interviewer. Generate 5 technical and 5 behavioral questions based on this CV with suggested answers. Return a JSON object.`;
    case 'cover_letter':
      return `${baseContext}Job Description:\n${jobDesc || 'A challenging role'}\n\nWrite a professional, ATS-friendly cover letter. Return a JSON object with: { "letter": "full text here" }.`;
    default:
      return `${baseContext}Analyze this CV and provide a summary.`;
  }
}

// ==================== AI GATEWAY (FALLBACK CHAIN) ====================
async function callAIGateway(prompt: string): Promise<any> {
  const systemPrompt = "Output ONLY valid JSON. No markdown, no explanations outside JSON.";

  // 1. Primary: Cloudflare
  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    try {
      const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], max_tokens: 1500 }),
        signal: AbortSignal.timeout(20000)
      });
      if (cfRes.ok) {
        const data = await cfRes.json();
        let text = data?.result?.response || '';
        if (Array.isArray(text)) text = text.join(' ');
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (e) { console.warn('Cloudflare failed, trying Groq...'); }
  }

  // 2. Fallback 1: Groq
  if (GROQ_API_KEY) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.1, max_tokens: 1500 }),
        signal: AbortSignal.timeout(20000)
      });
      if (groqRes.ok) {
        const data = await groqRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (e) { console.warn('Groq failed, trying OpenRouter...'); }
  }

  // 3. Fallback 2: OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://jobswitchers.com' },
        body: JSON.stringify({ model: 'deepseek/deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.1 }),
        signal: AbortSignal.timeout(25000)
      });
      if (orRes.ok) {
        const data = await orRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch (e) { console.error('All AI providers failed.'); }
  }

  throw new Error('All AI providers failed or are unavailable.');
}

// ==================== POST API (PREMIUM AI GATEWAY - NO REDIS) ====================
export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get('X-Session-ID');
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { textHash, feature, cvText, jobDescription } = body;

    if (!textHash || !feature || !cvText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

        // Check Premium Status
    const session = await prisma.appSession.findUnique({ where: { session_id: sessionId } });
    if (!session || (session.tier !== 'accelerator' && session.tier !== 'premium' && session.tier !== 'pro' && session.tier !== 'bundle')) {
      return NextResponse.json({ error: 'Premium subscription required', upgradeUrl: '/dashboard' }, { status: 403 });
    }

    if (session.tier_expires && new Date(session.tier_expires) < new Date()) {
      return NextResponse.json({ error: 'Subscription expired', upgradeUrl: '/dashboard?show_paywall=true' }, { status: 403 });
    }

    // 2. Check Database Cache (Using ai_results table instead of Redis)
    // Cache valid for 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const cachedResult = await prisma.aiResult.findFirst({
      where: {
        text_hash: textHash,
        feature_name: feature,
        created_at: { gte: sevenDaysAgo }
      },
      orderBy: { created_at: 'desc' }
    });

    if (cachedResult) {
      console.log(`✅ DB Cache hit for ${feature}`);
      
      // Update AI calls counter
      await prisma.appSession.update({
        where: { session_id: sessionId },
        data: { ai_calls_used: { increment: 1 } }
      });
      
      return NextResponse.json({ 
        success: true, 
        data: cachedResult.result_json, 
        source: 'db_cache',
        message: `${feature} retrieved from database cache`
      });
    }

    // 3. Call AI Gateway
    console.log(`🔄 Generating ${feature} via AI Gateway...`);
    const prompt = getPromptForFeature(feature, cvText, jobDescription);
    const aiResult = await callAIGateway(prompt);

    // 4. Save to Database (Acts as Cache)
    try {
      await prisma.aiResult.create({
        data: {
          text_hash: textHash,
          feature_name: feature,
          result_json: aiResult as any
        }
      });
      
      // Update AI calls counter
      await prisma.appSession.update({
        where: { session_id: sessionId },
        data: { ai_calls_used: { increment: 1 } }
      });
      
      console.log(`✅ ${feature} saved to database`);
    } catch (dbErr) {
      console.warn('⚠️ DB save failed, but returning result anyway.');
    }

    return NextResponse.json({ 
      success: true, 
      data: aiResult, 
      source: 'ai_gateway',
      message: `${feature} generated successfully`
    });

  } catch (error: any) {
    console.error('❌ Premium AI Gateway Error:', error);
    return NextResponse.json({ error: error.message || 'AI Generation failed' }, { status: 500 });
  }
}