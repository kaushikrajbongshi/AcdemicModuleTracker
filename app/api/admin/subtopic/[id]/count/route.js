import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";
import { getAllDescendantSubtopicIds } from "@/utils/subtopic-utils";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;
  const Params = await params;
  try {
    const subtopicId = Number(Params.id);

    if (!subtopicId) {
      return NextResponse.json(
        { error: "Invalid subtopic id" },
        { status: 400 },
      );
    }

    const descendantIds = await getAllDescendantSubtopicIds(prisma, subtopicId);

    return NextResponse.json({
      count: descendantIds.length + 1, // include self
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete subtopic" },
      { status: 500 },
    );
  }
}
