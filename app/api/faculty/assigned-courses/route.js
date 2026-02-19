import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { roleGuard } from "@/utils/roleguard";

export async function GET() {
  try {
    const guard = await roleGuard(["TEACHER"])(req);
    if (guard) return guard;

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const facultyId = decoded.id;

    // 1️⃣ Get active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { success: false, message: "No active academic year found" },
        { status: 400 },
      );
    }

    // 2️⃣ Fetch assigned courses for this faculty & year
    const assignedCourses = await prisma.facultyCourse.findMany({
      where: {
        facultyId,
        academicYearId: activeYear.id,
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

    return NextResponse.json({
      success: true,
      result: assignedCourses.map((fc) => ({
        course_id: fc.course.course_id,
        course_name: fc.course.course_name,
      })),
    });
  } catch (error) {
    console.error("Assigned courses fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
