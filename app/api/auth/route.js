import { prisma } from "@/lib/prisma";
import { compare_password, generate_jsonwebtoken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false },
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Get user from correct table
    const models = {
      admin: prisma.admin,
      faculty: prisma.faculty,
      student: prisma.student,
    };

    // Check email according to role
    const model = models[role];
    if (!model) {
      return NextResponse.json(
        { success: false },
        { message: "Invalid role" },
        { status: 404 }
      );
    }

    const user = await model.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false },
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isMatch = await compare_password(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false },
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generate_jsonwebtoken({
      id: user.id,
      role: role,
      faculty_role: user.role,
    });

    // Set cookie - AWAIT cookies() first
    const cookieStore = await cookies();
    cookieStore.set("LOGIN_INFO", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json(
      { success: true, role },
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false },
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
