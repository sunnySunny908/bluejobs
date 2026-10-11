import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook received:", body);

    // Instamojo sends status as 'Credit' for success
    if (body.status === 'Credit') {
      const paymentId = body.payment_request_id;
      
      // ✅ FIX: findFirst instead of findUnique
      const payment = await prisma.payment.findFirst({
        where: { razorpay_order_id: paymentId }
      });

      if (payment) {
        // 1. Update Payment Status
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'success', 
            razorpay_payment_id: body.payment_id 
          }
        });

        // 2. Upgrade User Tier
        const expiresAt = payment.plan === 'premium' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

        await prisma.session.update({
          where: { session_id: payment.session_id },
          data: { 
            tier: payment.plan, 
            tier_expires: expiresAt 
          }
        });
        
        console.log(`✅ User ${payment.session_id} upgraded to ${payment.plan}`);
      } else {
        console.warn("⚠️ No pending payment found for:", paymentId);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}