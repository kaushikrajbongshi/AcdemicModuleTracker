import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

export async function GET(req) {
  try {


    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get("courseId");
    const semesterId = searchParams.get("semesterId");
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

    if (!courseId || !semesterId || !academicYearId || !facultyId) {
      return NextResponse.json(
        { success: true, markedTopics: [], markedSubtopics: [] },
        { status: 200 },
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
      markedTopics: topics.map((t) => t.topicId),
      markedSubtopics: subtopics.map((s) => s.subtopicId),
    });
  } catch (error) {
    console.error("Status fetch failed:", error);

    // ⚠️ STILL DO NOT BREAK FRONTEND
    return NextResponse.json(
      { success: true, markedTopics: [], markedSubtopics: [] },
      { status: 200 },
    );
  }
}
