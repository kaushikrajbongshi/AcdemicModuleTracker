import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubtopicWithDescendantsForSubtopic } from "@/utils/mark-subtopic-utils";
import { roleGuard } from "@/utils/roleguard";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function POST(request, { params }) {
  const Params = await params;

  try {
    const subtopicId = Number(Params.subtopicId);
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const faculty_Id = decoded.id;

    const { courseId, semesterId } = await request.json();
    const facultyId = Number(faculty_Id);

    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { success: false, message: "No active academic year found" },
        { status: 400 },
      );
    }

    const academicYearId = activeYear.id;

    if (
      !subtopicId ||
      !courseId ||
      !semesterId ||
      !academicYearId ||
      !facultyId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 🔍 already marked?
    const exists = await prisma.subTopicCoverage.findFirst({
      where: {
        subtopicId,
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Subtopic already marked" },
        { status: 409 },
      );
    }

    // ✅ create coverage
    const ids = await getSubtopicWithDescendantsForSubtopic(prisma, subtopicId);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.subTopicCoverage.findMany({
        where: {
          subtopicId: { in: ids },
          facultyId,
          courseId,
          semesterId,
          academicYearId,
        },
        select: { subtopicId: true },
      });

      const existingIds = new Set(existing.map((e) => e.subtopicId));

      const toCreate = ids
        .filter((id) => !existingIds.has(id))
        .map((id) => ({
          subtopicId: id,
          facultyId,
          courseId,
          semesterId,
          academicYearId,
          taughtOn: new Date(),
        }));

      if (toCreate.length > 0) {
        await tx.subTopicCoverage.createMany({ data: toCreate });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subtopic and all nested subtopics marked successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to mark subtopic" },
      { status: 500 },
    );
  }
}

//Unmark subtopic

export async function DELETE(request, { params }) {
  const Params = await params;

  try {
    const subtopicId = Number(Params.subtopicId);

    const { courseId, semesterId, faculty_Id } = await request.json();
    const facultyId = Number(faculty_Id);

    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!activeYear) {
      return NextResponse.json(
        { success: false, message: "No active academic year found" },
        { status: 400 },
      );
    }

    const academicYearId = activeYear.id;

    if (
      !subtopicId ||
      !courseId ||
      !semesterId ||
      !academicYearId ||
      !facultyId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const exists = await prisma.subTopicCoverage.findFirst({
      where: {
        subtopicId,
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
    });

    if (!exists) {
      return NextResponse.json(
        { success: false, message: "Subtopic is not marked" },
        { status: 409 },
      );
    }

    const ids = await getSubtopicWithDescendantsForSubtopic(prisma, subtopicId);

    await prisma.subTopicCoverage.deleteMany({
      where: {
        subtopicId: { in: ids },
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subtopic and all nested subtopics unmarked successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to unmark subtopic" },
      { status: 500 },
    );
  }
}
