import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get("courseId");
    const semesterId = searchParams.get("semesterId");
    const academicYearId = Number(searchParams.get("academicYearId"));
    const facultyId = Number(searchParams.get("facultyId"));

    if (!courseId || !semesterId || !academicYearId || !facultyId) {
      return NextResponse.json(
        { success: true, markedTopics: [], markedSubtopics: [] },
        { status: 200 }
      );
    }

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
      markedTopics: topics.map(t => t.topicId),
      markedSubtopics: subtopics.map(s => s.subtopicId),
    });
  } catch (error) {
    console.error("Status fetch failed:", error);

    // ⚠️ STILL DO NOT BREAK FRONTEND
    return NextResponse.json(
      { success: true, markedTopics: [], markedSubtopics: [] },
      { status: 200 }
    );
  }
}
