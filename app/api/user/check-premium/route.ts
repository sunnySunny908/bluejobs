import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }

    const session = await prisma.appSession.findUnique({
      where: { session_id: sessionId },
      select: { tier: true, tier_expires: true },
    });

    if (!session) {
      return NextResponse.json({ isPremium: false }, { status: 200 });
    }
    const now = new Date();
    const isPremium = session.tier !== 'free' && session.tier_expires && new Date(session.tier_expires) > now;

    return NextResponse.json({ 
      isPremium, 
      tier: session.tier,
      expiresAt: session.tier_expires 
    }, { status: 200 });

  } catch (error) {
    console.error('Check Premium Error:', error);
    return NextResponse.json({ isPremium: false }, { status: 500 });
  }
}