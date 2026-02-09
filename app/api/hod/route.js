import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required" },
        { status: 400 }
      );
    }

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

    // 2️⃣ Total subtopics in this course
    const totalSubtopics = await prisma.subTopic.count({
      where: {
        topic: { courseId },
      },
    });

    // 3️⃣ Faculties teaching this course
    const faculties = await prisma.faculty.findMany({
      where: {
        facultyCourses: {
          some: { courseId },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    let results = [];

    for (const faculty of faculties) {
      // 4️⃣ Covered subtopics (course-specific)
      const completedSubtopics = await prisma.subTopicCoverage.count({
        where: {
          facultyId: faculty.id,
          academicYearId,
          courseId,
        },
      });

      const progress =
        totalSubtopics === 0
          ? 0
          : Math.round((completedSubtopics / totalSubtopics) * 100);

      // 5️⃣ Last updated
      const lastActivity = await prisma.subTopicCoverage.findFirst({
        where: {
          facultyId: faculty.id,
          academicYearId,
          courseId,
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      // 6️⃣ Status
      let status = "LAGGING";
      if (progress >= 70) status = "ON_TRACK";
      else if (progress >= 40) status = "MODERATE";

      results.push({
        facultyId: faculty.id,
        facultyName: faculty.name,
        topicsCovered: `${completedSubtopics} / ${totalSubtopics}`,
        progress,
        status,
        lastUpdated: lastActivity?.createdAt ?? null,
      });
    }

    // 7️⃣ Summary
    const totalFaculties = results.length;
    const averageProgress =
      totalFaculties === 0
        ? 0
        : Math.round(
            results.reduce((sum, f) => sum + f.progress, 0) / totalFaculties
          );

    const onTrack = results.filter(f => f.status === "ON_TRACK").length;
    const lagging = results.filter(f => f.status === "LAGGING").length;

    return NextResponse.json({
      summary: {
        courseId,
        totalFaculties,
        averageProgress,
        onTrack,
        lagging,
      },
      faculties: results,
    });
  } catch (error) {
    console.error("Course comparison error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
