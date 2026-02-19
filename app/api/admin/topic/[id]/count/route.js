import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;
  const Params = await params;
  try {
    const topicId = Number(Params.id);

    if (!topicId) {
      return NextResponse.json({ error: "Invalid topic id" }, { status: 400 });
    }

    // 🔥 COUNT ALL SUBTOPICS UNDER THIS TOPIC
    const subtopicCount = await prisma.subTopic.count({
      where: {
        topicId: topicId,
      },
    });

    return NextResponse.json({
      count: subtopicCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to count topic delete impact" },
      { status: 500 },
    );
  }
}
