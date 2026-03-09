import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = Number(searchParams.get("facultyId"));
    const academicYearId = Number(searchParams.get("academicYearId"));

    if (!facultyId || !academicYearId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 },
      );
    }

    // ================= VERIFY TOKEN =================
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
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

    // ================= VERIFY FACULTY DEPARTMENT =================
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { dept_id: true },
    });

    if (!faculty || faculty.dept_id !== hod.dept_id) {
      return NextResponse.json(
        { success: false, message: "Faculty not in your department" },
        { status: 403 },
      );
    }

    // ================= FETCH COURSES =================
    const courses = await prisma.facultyCourse.findMany({
      where: {
        facultyId,
        academicYearId,
      },
      include: {
        course: {
          select: {
            course_id: true,
            course_name: true,
          },
        },
      },
    });

    const result = courses.map((c) => ({
      course_id: c.course.course_id,
      course_name: c.course.course_name,
    }));

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("FACULTY COURSE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty courses" },
      { status: 500 },
    );
  }
}
