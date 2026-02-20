import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    console.log(courseId);

    if (!courseId) {
      return NextResponse.json(
        { message: "courseId is required" },
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

    // 2️⃣ Fetch topics of this course
    const topics = await prisma.topic.findMany({
      where: { courseId },
      select: {
        topic_id: true,
        topic_name: true,
      },
      orderBy: { topic_id: "asc" },
    });

    if (topics.length === 0) {
      return NextResponse.json([]);
    }

    // 3️⃣ Build topic-wise progress
    const result = await Promise.all(
      topics.map(async (topic) => {
        const totalSubtopics = await prisma.subTopic.count({
          where: { topicId: topic.topic_id },
        });

        const completedSubtopics = await prisma.subTopicCoverage.count({
          where: {
            facultyId,
            academicYearId,
            subtopic: {
              topicId: topic.topic_id,
            },
          },
        });

        const topicMarked = await prisma.topicCoverage.count({
          where: {
            facultyId,
            academicYearId,
            topicId: topic.topic_id,
          },
        });

        const isCompleted =
          totalSubtopics > 0
            ? completedSubtopics === totalSubtopics
            : topicMarked > 0;

        return {
          topicId: topic.topic_id,
          topicName: topic.topic_name,
          totalSubtopics,
          completedSubtopics,
          status: isCompleted ? "Completed" : "In Progress",
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Topic-wise progress error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
