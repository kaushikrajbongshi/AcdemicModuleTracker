import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

export async function GET(req) {
  try {


    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (decoded.faculty_role !== "HOD") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required" },
        { status: 400 },
      );
    }

    // ✅ Get HOD's dept_id from DB using id from token
    const hod = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: { dept_id: true },
    });

    if (!hod) {
      return NextResponse.json({ message: "HOD not found" }, { status: 404 });
    }

    const hodDepartmentId = hod.dept_id;

    // ✅ Verify the requested courseId belongs to HOD's department
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { dept_id: true },
    });

    if (!course || course.dept_id !== hodDepartmentId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Active academic year
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

    const totalSubtopics = await prisma.subTopic.count({
      where: { topic: { courseId } },
    });

    // ✅ Only faculties in HOD's dept assigned to this course in the active year
    const faculties = await prisma.faculty.findMany({
      where: {
        dept_id: hodDepartmentId,
        status: "A",
        facultyCourses: {
          some: { courseId, academicYearId },
        },
      },
      select: {
        id: true,
        name: true,
        department: { select: { dept_name: true } },
      },
    });

    let results = [];

    for (const faculty of faculties) {
      const completedSubtopics = await prisma.subTopicCoverage.count({
        where: { facultyId: faculty.id, academicYearId, courseId },
      });

      const progress =
        totalSubtopics === 0
          ? 0
          : Math.round((completedSubtopics / totalSubtopics) * 100);

      const lastActivity = await prisma.subTopicCoverage.findFirst({
        where: { facultyId: faculty.id, academicYearId, courseId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      let status = "LAGGING";
      if (progress >= 70) status = "ON_TRACK";
      else if (progress >= 40) status = "MODERATE";

      results.push({
        facultyId: faculty.id,
        facultyName: faculty.name,
        topicsCovered: `${completedSubtopics}/${totalSubtopics}`,
        progress,
        status,
        department: faculty.department.dept_name,
        lastUpdated: lastActivity?.createdAt ?? null,
      });
    }

    const totalFaculties = results.length;
    const averageProgress =
      totalFaculties === 0
        ? 0
        : Math.round(
            results.reduce((sum, f) => sum + f.progress, 0) / totalFaculties,
          );
    const onTrack = results.filter((f) => f.status === "ON_TRACK").length;
    const lagging = results.filter((f) => f.status === "LAGGING").length;

    return NextResponse.json({
      summary: { courseId, totalFaculties, averageProgress, onTrack, lagging },
      faculties: results,
    });
  } catch (error) {
    console.error("Course faculty progress error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
