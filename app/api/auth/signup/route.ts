import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log("📝 Signup API called");
    
    const body = await req.json();
    console.log("📦 Request body:", { ...body, password: "***" });

    const { name, email, mobile, password } = body;

    // Validation
    if (!email || !password || !name) {
      console.log("❌ Validation failed: Missing fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check database connection first
    try {
      await prisma.$connect();
      console.log("✅ Database connected successfully");
    } catch (dbError: any) {
      console.error("❌ Database connection failed:", dbError.message);
      return NextResponse.json(
        { error: "Database connection failed: " + dbError.message },
        { status: 500 }
      );
    }

    // Check if user exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log("⚠️ User already exists:", email);
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    } catch (findError: any) {
      console.error("❌ Error finding user:", findError.message);
      return NextResponse.json(
        { error: "Database query failed: " + findError.message },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed successfully");

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: mobile || null,
          password: hashedPassword,
          applyCount: 0,
        },
      });

      console.log("✅ User created successfully:", user.id);
      return NextResponse.json({
        success: true,
        message: "User created successfully",
        userId: user.id,
      });
    } catch (createError: any) {
      console.error("❌ Error creating user:", createError.message);
      return NextResponse.json(
        { error: "Failed to create user: " + createError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("❌ Signup error:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: "Something went wrong: " + error.message },
      { status: 500 }
    );
  }
}