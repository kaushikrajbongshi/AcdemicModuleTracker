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

    if (decoded.faculty_role !== "HOD") {
      return NextResponse.json(
        { success: false, message: "Unauthorized Only for HOD" },
        { status: 401 },
      );
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: { dept_id: true },
    });

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 },
      );
    }

    const hodDepartmentId = faculty.dept_id;

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

    // 2️⃣ Courses under HOD department
    const courses = await prisma.course.findMany({
      where: { dept_id: hodDepartmentId },
      select: {
        course_id: true,
        course_name: true,
        semester_id: true,
        facultyCourses: {
          select: { facultyId: true },
        },
      },
    });

    let results = [];

    for (const course of courses) {
      // 3️⃣ Total subtopics in course
      const totalSubtopics = await prisma.subTopic.count({
        where: {
          topic: { courseId: course.course_id },
        },
      });

      // 4️⃣ Completed subtopics (any faculty)
      const completedSubtopics = await prisma.subTopicCoverage.count({
        where: {
          academicYearId,
          courseId: course.course_id,
        },
      });

      const progress =
        totalSubtopics === 0
          ? 0
          : Math.round((completedSubtopics / totalSubtopics) * 100);

      // 5️⃣ Last activity
      const lastActivity = await prisma.subTopicCoverage.findFirst({
        where: {
          academicYearId,
          courseId: course.course_id,
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      // 6️⃣ Status
      let status = "LAGGING";
      if (progress >= 70) status = "ON_TRACK";
      else if (progress >= 40) status = "MODERATE";

      results.push({
        courseId: course.course_id,
        courseName: course.course_name,
        semester: course.semester_id,
        facultyCount: course.facultyCourses.length,
        progress,
        status,
        lastUpdated: lastActivity?.createdAt ?? null,
      });
    }

    // 7️⃣ Summary
    const totalCourses = results.length;

    const averageProgress =
      totalCourses === 0
        ? 0
        : Math.round(
            results.reduce((sum, c) => sum + c.progress, 0) / totalCourses,
          );

    const onTrack = results.filter((c) => c.status === "ON_TRACK").length;

    const lagging = results.filter((c) => c.status === "LAGGING").length;

    return NextResponse.json({
      summary: {
        totalCourses,
        averageProgress,
        onTrack,
        lagging,
      },
      courses: results,
    });
  } catch (error) {
    console.error("Course comparison error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
