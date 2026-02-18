import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
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

    if (decoded.faculty_role !== "HOD") {
      return NextResponse.json(
        { success: false, message: "Unauthorized Only for HOD" },
        { status: 401 },
      );
    }

    // Find HOD
    const hod = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: {
        dept_id: true,
        department: { select: { dept_name: true } },
      },
    });

    if (!hod) {
      return NextResponse.json({ message: "HOD not found" }, { status: 404 });
    }

    const hodDepartmentId = hod.dept_id;
    const hodDepartmentName = hod.department.dept_name;

    // 1️⃣ Active academic year
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

    const academicYearId = academicYear.id;
    const faculties = await prisma.faculty.findMany({
      where: {
        dept_id: hodDepartmentId,
        status: "A",
      },
      select: {
        id: true,
        name: true,
        facultyCourses: {
          where: { academicYearId },
          select: {
            courseId: true,
            course: { select: { course_name: true } },
          },
        },
      },
    });

    let facultyResults = [];

    for (const faculty of faculties) {
      const courseIds = faculty.facultyCourses.map((fc) => fc.courseId);
      const courses = faculty.facultyCourses.map((fc) => fc.course.course_name);

      if (courseIds.length === 0) {
        facultyResults.push({
          facultyId: faculty.id,
          facultyName: faculty.name,
          department: hodDepartmentName,
          courses: [],
          progress: 0,
          status: "LAGGING",
          lastUpdated: null,
        });
        continue;
      }

      const totalSubtopics = await prisma.subTopic.count({
        where: { topic: { courseId: { in: courseIds } } },
      });

      const completedSubtopics = await prisma.subTopicCoverage.count({
        where: {
          facultyId: faculty.id,
          academicYearId,
          courseId: { in: courseIds },
        },
      });

      const progress =
        totalSubtopics === 0
          ? 0
          : Math.round((completedSubtopics / totalSubtopics) * 100);

      const lastActivity = await prisma.subTopicCoverage.findFirst({
        where: {
          facultyId: faculty.id,
          academicYearId,
          courseId: { in: courseIds },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      let status = "LAGGING";
      if (progress >= 70) status = "ON_TRACK";
      else if (progress >= 40) status = "MODERATE";

      facultyResults.push({
        facultyId: faculty.id,
        facultyName: faculty.name,
        department: hodDepartmentName,
        courses,
        progress,
        status,
        lastUpdated: lastActivity?.createdAt ?? null,
      });
    }

    const totalFaculties = facultyResults.length;
    const averageProgress =
      totalFaculties === 0
        ? 0
        : Math.round(
            facultyResults.reduce((sum, f) => sum + f.progress, 0) /
              totalFaculties,
          );
    const onTrack = facultyResults.filter(
      (f) => f.status === "ON_TRACK",
    ).length;
    const lagging = facultyResults.filter((f) => f.status === "LAGGING").length;

    return NextResponse.json({
      summary: { totalFaculties, averageProgress, onTrack, lagging },
      faculties: facultyResults,
    });
  } catch (error) {
    console.error("HOD overview error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
