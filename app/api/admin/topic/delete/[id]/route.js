import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;
  
  const Params = await params;
  try {
    const topicId = Number(Params.id);

    if (!topicId) {
      return NextResponse.json(
        { success: false, message: "Invalid topic id" },
        { status: 400 },
      );
    }

    // 1️⃣ Check topic coverage
    const topicCoverageCount = await prisma.topicCoverage.count({
      where: { topicId },
    });

    // 2️⃣ Check subtopic coverage
    const subtopicCoverageCount = await prisma.subTopicCoverage.count({
      where: {
        subtopic: {
          topicId,
        },
      },
    });

    // 3️⃣ Block delete if history exists
    if (topicCoverageCount > 0 || subtopicCoverageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete topic. Teaching history exists for this topic or its subtopics.",
        },
        { status: 400 },
      );
    }

    // 4️⃣ Safe delete (order matters)
    await prisma.subTopic.deleteMany({
      where: { topicId },
    });

    await prisma.topic.delete({
      where: { topic_id: topicId },
    });

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TOPIC ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete topic" },
      { status: 500 },
    );
  }
}
