import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const Params = await params;
  console.log("params", Params);

  const id = Params.id;
  console.log("id", id);
  try {
    const topicId = Number(Params.id);
    console.log("this is id:", topicId);

    if (!topicId) {
      return Response.json({ error: "Invalid topic id" }, { status: 400 });
    }

    const res_topic = await prisma.topic.delete({
      where: { topic_id: topicId },
    });

    const res_subtopic = await prisma.subTopic.deleteMany({
      where: { topicId: topicId },
    });

    if (res_topic || res_subtopic) {
      return NextResponse.json(
        { status: true },
        { message: "Topic or Subtopic Deleted sucessful" }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete subtopic" },
      { status: 500 }
    );
  }
}
