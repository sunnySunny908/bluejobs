import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, plan, amount, email, name } = await req.json();

    // 1. Database me pending payment record banayein
    await prisma.payment.create({
      data: {
        session_id: sessionId,
        plan,
        amount,
        status: 'pending',
      },
    });

    // 2. Instamojo API Call
    const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
    const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            // ✅ Instamojo Live URL use karein (Test accounts bhi ab ispar kaam karte hain)
    const INSTAMOJO_BASE_URL = 'https://www.instamojo.com/api/1.1';

    const response = await fetch(`${INSTAMOJO_BASE_URL}/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY!,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purpose: `JobSwitchers ${plan.toUpperCase()} Plan`,
        amount: amount.toString(),
        buyer_name: name || 'User',
        email: email || 'user@example.com',
        redirect_url: `${BASE_URL}/dashboard?payment=success`,
        webhook: `${BASE_URL}/api/payment/webhook`,
        allow_repeated_payments: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Instamojo API Error');
    }

    // 3. Payment Request ID database me update karein
    await prisma.payment.updateMany({
      where: { session_id: sessionId, status: 'pending' },
      data: { instamojo_payment_request_id: data.payment_request.id },
    });

    return NextResponse.json({ 
      success: true, 
      paymentUrl: data.payment_request.longurl 
    });

  } catch (error: any) {
    console.error('Payment Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}