import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, paymentId, plan } = await req.json();

    if (!sessionId || !paymentId) {
      return NextResponse.json({ error: 'Missing session or payment ID' }, { status: 400 });
    }

    // 1. Security Check: Valid Instamojo ID format
    const cleanId = paymentId.trim().toUpperCase();
    if (!cleanId.startsWith('MOJO') || cleanId.length < 12) {
      return NextResponse.json({ error: 'Invalid Payment ID format. Must start with MOJO.' }, { status: 400 });
    }

    // 2. Fraud Prevention: Check if this Payment ID was already used
    const existing = await prisma.payment.findFirst({
      where: { razorpay_payment_id: cleanId }
    });

    if (existing) {
      return NextResponse.json({ error: 'This Payment ID has already been used.' }, { status: 400 });
    }

    // 3. Update Database (Optimistic Unlock)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan === 'premium' ? 30 : 365));

    await prisma.session.update({
      where: { session_id: sessionId },
      data: {
        tier: plan === 'premium' ? 'premium' : 'accelerator',
        tier_expires: expiresAt,
        updated_at: new Date()
      }
    });

    // 4. Save Payment Record
    await prisma.payment.create({
      data: {
        session_id: sessionId,
        razorpay_payment_id: cleanId,
        razorpay_order_id: 'direct_instamojo_link',
        plan: plan === 'premium' ? 'premium' : 'accelerator',
        amount: plan === 'premium' ? 149 : 99,
        status: 'success'
      }
    });

    return NextResponse.json({ success: true, message: 'Premium Unlocked Successfully' });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}