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
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    let user;

    // =========================
    // ADMIN LOGIN
    // =========================
    if (role === "admin") {
      user = await prisma.admin.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Admin not found" },
          { status: 404 }
        );
      }
    }

    // =========================
    // FACULTY LOGIN
    // =========================
    else if (role === "faculty") {
      user = await prisma.faculty.findUnique({
        where: { email },
        include: { facultyRole: true },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Faculty not found" },
          { status: 404 }
        );
      }
    }

    // =========================
    // STUDENT LOGIN
    // =========================
    else if (role === "student") {
      user = await prisma.student.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Student not found" },
          { status: 404 }
        );
      }
    }

    else {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // =========================
    // PASSWORD CHECK
    // =========================
    const isMatch = await compare_password(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    // =========================
    // GENERATE TOKEN
    // =========================
    const token = generate_jsonwebtoken({
      id: user.id,
      role: role,
      faculty_role:
        role === "faculty" ? user.facultyRole.description : null,
      name: user.name,
    });

    // =========================
    // SET COOKIE
    // =========================
    const cookieStore = await cookies();

    cookieStore.set("LOGIN_INFO", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return NextResponse.json(
      {
        success: true,
        role,
        message: "Login successful",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
