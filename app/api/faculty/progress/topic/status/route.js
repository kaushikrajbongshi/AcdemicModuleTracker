import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

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

    if (!courseId) {
      return NextResponse.json(
        { success: true, markedTopics: [], markedSubtopics: [] },
        { status: 200 },
      );
    }

    // 1️⃣ Get active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { success: true, markedTopics: [], markedSubtopics: [] },
        { status: 200 },
      );
    }

    const academicYearId = activeYear.id;

    // 2️⃣ Get semesterId FROM COURSE (not frontend)
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { semester_id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: true, markedTopics: [], markedSubtopics: [] },
        { status: 200 },
      );
    }

    const semesterId = course.semester_id;

    // 3️⃣ Validate faculty assignment
    const assignment = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId,
        academicYearId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Unauthorized course access" },
        { status: 403 },
      );
    }

    // 4️⃣ Fetch marked topics & subtopics
    const [topics, subtopics] = await Promise.all([
      prisma.topicCoverage.findMany({
        where: {
          courseId,
          semesterId,
          academicYearId,
          facultyId,
        },
        select: { topicId: true },
      }),

      prisma.subTopicCoverage.findMany({
        where: {
          courseId,
          semesterId,
          academicYearId,
          facultyId,
        },
        select: { subtopicId: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      markedTopics: topics.map((t) => t.topicId),
      markedSubtopics: subtopics.map((s) => s.subtopicId),
    });
  } catch (error) {
    console.error("Status fetch failed:", error);

    return NextResponse.json(
      { success: true, markedTopics: [], markedSubtopics: [] },
      { status: 200 },
    );
  }
}
