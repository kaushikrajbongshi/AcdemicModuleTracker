import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");
    const courseId = searchParams.get("courseId");

    if (!facultyId || !courseId) {
      return NextResponse.json(
        { message: "facultyId and courseId are required" },
        { status: 400 },
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
        { status: 400 },
      );
    }

    const academicYearId = academicYear.id;

    // 2️⃣ Topics + subtopics
    const topics = await prisma.topic.findMany({
      where: { courseId },
      select: {
        topic_id: true,
        topic_name: true,
        subtopics: {
          select: {
            subtopic_id: true,
          },
        },
      },
    });

    let completedSubtopicsTotal = 0;
    let totalSubtopicsTotal = 0;
    const topicResults = [];

    for (const topic of topics) {
      const totalSubtopics = topic.subtopics.length;

      const completedSubtopics = await prisma.subTopicCoverage.count({
        where: {
          facultyId: Number(facultyId),
          academicYearId,
          subtopicId: {
            in: topic.subtopics.map((s) => s.subtopic_id),
          },
        },
      });

      totalSubtopicsTotal += totalSubtopics;
      completedSubtopicsTotal += completedSubtopics;

      let status = "not-started";
      if (completedSubtopics === totalSubtopics && totalSubtopics > 0) {
        status = "completed";
      } else if (completedSubtopics > 0) {
        status = "in-progress";
      }

      topicResults.push({
        topicId: topic.topic_id,
        topicName: topic.topic_name,
        completedSubtopics,
        totalSubtopics,
        status,
      });
    }

    const overallProgress =
      totalSubtopicsTotal === 0
        ? 0
        : Math.round((completedSubtopicsTotal / totalSubtopicsTotal) * 100);

    return NextResponse.json({
      summary: {
        overallProgress,
        totalTopics: topics.length,
        completedTopics: topicResults.filter((t) => t.status === "completed")
          .length,
        pendingTopics:
          topics.length -
          topicResults.filter((t) => t.status === "completed").length,
      },
      topics: topicResults,
    });
  } catch (error) {
    console.error("Faculty progress error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
