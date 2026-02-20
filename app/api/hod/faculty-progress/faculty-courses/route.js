import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

export async function GET(req) {
  try {

    
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (decoded.faculty_role !== "HOD") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!facultyId) {
      return NextResponse.json(
        { message: "facultyId is required" },
        { status: 400 },
      );
    }

    // ✅ Get HOD's dept_id from DB
    const hod = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: { dept_id: true },
    });

    if (!hod) {
      return NextResponse.json({ message: "HOD not found" }, { status: 404 });
    }

    // ✅ Verify the requested faculty belongs to HOD's department
    const targetFaculty = await prisma.faculty.findUnique({
      where: { id: Number(facultyId) },
      select: { dept_id: true },
    });

    if (!targetFaculty || targetFaculty.dept_id !== hod.dept_id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ Active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { message: "Active academic year not found" },
        { status: 400 },
      );
    }

    // ✅ Only courses assigned in the active academic year
    const facultyCourses = await prisma.facultyCourse.findMany({
      where: {
        facultyId: Number(facultyId),
        academicYearId: academicYear.id,
      },
      select: {
        course: {
          select: {
            course_id: true,
            course_name: true,
          },
        },
      },
    });

    const courses = facultyCourses.map((fc) => ({
      id: fc.course.course_id,
      name: fc.course.course_name,
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Faculty courses error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
