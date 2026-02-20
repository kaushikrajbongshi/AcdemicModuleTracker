import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

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

    // 2️⃣ Faculty courses
    const facultyCourses = await prisma.facultyCourse.findMany({
      where: { facultyId, academicYearId },
      select: { courseId: true },
    });

    const courseIds = facultyCourses.map((fc) => fc.courseId);

    if (courseIds.length === 0) {
      return NextResponse.json({
        overallProgress: 0,
        totalTopics: 0,
        completedTopics: 0,
        pendingTopics: 0,
        totalSubtopics: 0,
        completedSubtopics: 0,
        lastUpdated: null,
      });
    }

    // 3️⃣ Total topics
    const totalTopics = await prisma.topic.count({
      where: { courseId: { in: courseIds } },
    });

    // 4️⃣ Total subtopics
    const totalSubtopics = await prisma.subTopic.count({
      where: {
        topic: { courseId: { in: courseIds } },
      },
    });

    // 5️⃣ Completed subtopics
    const completedSubtopics = await prisma.subTopicCoverage.count({
      where: {
        facultyId,
        academicYearId,
        courseId: { in: courseIds },
      },
    });

    // 6️⃣ Completed topics (FIXED LOGIC)
    const placeholders = courseIds.map(() => "?").join(",");

    const completedTopicsRaw = await prisma.$queryRawUnsafe(
      `
        SELECT DISTINCT t.topic_id
        FROM topic t
        WHERE t.courseId IN (${placeholders})
          AND (
            -- Option 1: Topic is directly marked as covered
            EXISTS (
              SELECT 1 
              FROM topic_coverage tc
              WHERE tc.topicId = t.topic_id
                AND tc.facultyId = ?
                AND tc.academicYearId = ?
            )
            OR
            -- Option 2: All subtopics are covered
            (
              EXISTS (SELECT 1 FROM subtopic st WHERE st.topicId = t.topic_id)
              AND NOT EXISTS (
                SELECT 1
                FROM subtopic st2
                WHERE st2.topicId = t.topic_id
                  AND NOT EXISTS (
                    SELECT 1
                    FROM subtopic_coverage sc
                    WHERE sc.subtopicId = st2.subtopic_id
                      AND sc.facultyId = ?
                      AND sc.academicYearId = ?
                  )
              )
            )
          )
  `,
      ...courseIds,
      facultyId,
      academicYearId,
      facultyId,
      academicYearId,
    );

    const completedTopics = completedTopicsRaw.length;
    const pendingTopics = totalTopics - completedTopics;

    // 7️⃣ Overall progress
    const overallProgress =
      totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

    // 8️⃣ Last updated
    const [lastTopicCoverage, lastSubtopicCoverage] = await Promise.all([
      prisma.topicCoverage.findFirst({
        where: {
          facultyId,
          academicYearId,
          courseId: { in: courseIds },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.subTopicCoverage.findFirst({
        where: {
          facultyId,
          academicYearId,
          courseId: { in: courseIds },
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    // Get the most recent between topic and subtopic coverage
    const lastUpdated =
      [lastTopicCoverage?.createdAt, lastSubtopicCoverage?.createdAt]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || null;

    return NextResponse.json({
      overallProgress,
      totalTopics,
      completedTopics,
      pendingTopics,
      totalSubtopics,
      completedSubtopics,
      lastUpdated,
    });
  } catch (error) {
    console.error("Progress summary error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
