import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Instamojo webhook payload check
    if (body.status === 'Credit' && body.payment_id) {
      const paymentId = body.payment_id;
      const paymentRequestId = body.payment_request_id;

      // 1. Payment record dhundhein
      const payment = await prisma.payment.findFirst({
        where: { instamojo_payment_request_id: paymentRequestId },
        include: { session: true },
      });

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // 2. Payment status update karein
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'success', 
          instamojo_payment_id: paymentId 
        },
      });

      // 3. User ka Premium Tier Update karein (30 ya 90 days)
      const today = new Date();
      const expiryDate = new Date(today);
      
      if (payment.plan === 'pro') {
        expiryDate.setDate(today.getDate() + 30);
      } else if (payment.plan === 'bundle') {
        expiryDate.setDate(today.getDate() + 90);
      }

      await prisma.appSession.update({
        where: { session_id: payment.session_id },
        data: { 
          tier: payment.plan, 
          tier_expires: expiryDate 
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ message: 'Ignored' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}