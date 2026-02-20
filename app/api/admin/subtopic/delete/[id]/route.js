import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";
import { getAllDescendantSubtopicIds } from "@/utils/subtopic-utils";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {

  const Params = await params;

  try {
    const subtopicId = Number(Params.id);
    console.log("DELETE SUBTOPIC PARAMS:", subtopicId);

    if (!subtopicId) {
      return NextResponse.json(
        { success: false, message: "Invalid subtopic id" },
        { status: 400 },
      );
    }

    // 1️⃣ find all descendants
    const descendantIds = await getAllDescendantSubtopicIds(prisma, subtopicId);

    // include the selected subtopic itself
    const allSubtopicIds = [subtopicId, ...descendantIds];

    // 2️⃣ check coverage for ANY of them
    const coverageCount = await prisma.subTopicCoverage.count({
      where: {
        subtopicId: { in: allSubtopicIds },
      },
    });

    if (coverageCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete subtopic. Teaching history exists for this subtopic or its children.",
        },
        { status: 400 },
      );
    }

    // 3️⃣ safe delete descendants FIRST
    if (descendantIds.length > 0) {
      await prisma.subTopic.deleteMany({
        where: {
          subtopic_id: { in: descendantIds },
        },
      });
    }

    // 4️⃣ delete selected subtopic
    await prisma.subTopic.delete({
      where: { subtopic_id: subtopicId },
    });

    return NextResponse.json({
      success: true,
      deletedCount: allSubtopicIds.length,
    });
  } catch (error) {
    console.error("DELETE SUBTOPIC ERROR FULL:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
