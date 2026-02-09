import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 🔐 TEMP: Replace with session-based HOD later
    const hodDepartmentId = "CSE";

    // 1️⃣ Active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { message: "Active academic year not found" },
        { status: 400 }
      );
    }

    const academicYearId = academicYear.id;

    // 2️⃣ Faculties under HOD department
    const faculties = await prisma.faculty.findMany({
      where: {
        facultyCourses: {
          some: {
            course: {
              dept_id: hodDepartmentId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        facultyCourses: {
          select: {
            courseId: true,
            course: {
              select: {
                course_name: true,
              },
            },
          },
        },
      },
    });

    let facultyResults = [];

    for (const faculty of faculties) {
      // ✅ Extract courseIds correctly
      const courseIds = faculty.facultyCourses.map(
        (fc) => fc.courseId
      );

      // ✅ Extract course names
      const courses = faculty.facultyCourses.map(
        (fc) => fc.course.course_name
      );

      if (courseIds.length === 0) continue;

      // 3️⃣ Total subtopics (all assigned courses)
      const totalSubtopics = await prisma.subTopic.count({
        where: {
          topic: {
            courseId: { in: courseIds },
          },
        },
      });

      // 4️⃣ Covered subtopics
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

      // 5️⃣ Last updated activity
      const lastActivity = await prisma.subTopicCoverage.findFirst({
        where: {
          facultyId: faculty.id,
          academicYearId,
          courseId: { in: courseIds },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      // 6️⃣ Status
      let status = "LAGGING";
      if (progress >= 70) status = "ON_TRACK";
      else if (progress >= 40) status = "MODERATE";

      facultyResults.push({
        facultyId: faculty.id,
        facultyName: faculty.name,
        courses, // ✅ REAL course names
        progress,
        status,
        lastUpdated: lastActivity?.createdAt ?? null,
      });
    }

    // 7️⃣ Summary
    const totalFaculties = facultyResults.length;

    const averageProgress =
      totalFaculties === 0
        ? 0
        : Math.round(
            facultyResults.reduce((sum, f) => sum + f.progress, 0) /
              totalFaculties
          );

    const onTrack = facultyResults.filter(
      (f) => f.status === "ON_TRACK"
    ).length;

    const lagging = facultyResults.filter(
      (f) => f.status === "LAGGING"
    ).length;

    return NextResponse.json({
      summary: {
        totalFaculties,
        averageProgress,
        onTrack,
        lagging,
      },
      faculties: facultyResults,
    });
  } catch (error) {
    console.error("HOD overview error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
