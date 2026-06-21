import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Login karo pehle" }, { status: 401 });
    }

    const { amount = 99, currency = "INR" } = await req.json();

    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ 
      orderId: order.id, 
      amount: amount, 
      currency: currency 
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Payment create nahi hua" }, { status: 500 });
  }
}