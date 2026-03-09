import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
    // ============================================
    // VERIFY TOKEN
    // ============================================
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // ============================================
    // VERIFY USER
    // ============================================
    const user = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: {
        facultyRole: {
          select: { description: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Allow HOD + ADMIN
    if (
      user.facultyRole.description !== "HOD" &&
      user.facultyRole.description !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // ============================================
    // FETCH YEARS (Correct Fields)
    // ============================================
    const years = await prisma.academicYear.findMany({
      orderBy: {
        id: "desc", // latest created first
      },
      select: {
        id: true,
        label: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      result: years,
    });
  } catch (error) {
    console.error("ACADEMIC YEAR FETCH ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch academic years" },
      { status: 500 }
    );
  }
}