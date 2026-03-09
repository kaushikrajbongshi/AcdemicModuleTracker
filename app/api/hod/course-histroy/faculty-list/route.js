import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYearId = Number(searchParams.get("academicYearId"));

    if (!academicYearId) {
      return NextResponse.json(
        { success: false, message: "Academic year required" },
        { status: 400 }
      );
    }

    // ================= VERIFY TOKEN =================
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // ================= VERIFY HOD =================
    const hod = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: {
        dept_id: true,
        role: true,
      },
    });


    // ================= FETCH FACULTY =================
    const facultyList = await prisma.faculty.findMany({
      where: {
        dept_id: hod.dept_id,
        facultyCourses: {
          some: {
            academicYearId,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      result: facultyList,
    });
  } catch (error) {
    console.error("FACULTY LIST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty list" },
      { status: 500 }
    );
  }
} 