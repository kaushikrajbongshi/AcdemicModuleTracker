import { prisma } from "@/lib/prisma";
import { getAllDescendantSubtopicIds } from "@/utils/subtopic-utils";
import { NextResponse } from "next/server";
export async function DELETE(req, { params }) {
  const Params = await params;
  try {
    const subtopicId = Number(Params.id);
    console.log("this is id:", subtopicId);

    if (!subtopicId) {
      return Response.json({ error: "Invalid subtopic id" }, { status: 400 });
    }

    // 1️⃣ find all descendants
    const descendantIds = await getAllDescendantSubtopicIds(prisma, subtopicId);

    // 2️⃣ delete descendants FIRST
    if (descendantIds.length > 0) {
      await prisma.subTopic.deleteMany({
        where: {
          subtopic_id: { in: descendantIds },
        },
      });
    }

    // 3️⃣ delete selected subtopic
    await prisma.subTopic.delete({
      where: { subtopic_id: subtopicId },
    });

    return NextResponse.json({
      success: true,
      deletedCount: descendantIds.length + 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete subtopic" },
      { status: 500 }
    );
  }
}
