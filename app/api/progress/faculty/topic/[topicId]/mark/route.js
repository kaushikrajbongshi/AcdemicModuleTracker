import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";
import { getAllDescendantSubtopicIdsMark } from "@/utils/mark-subtopic-utils";

export async function POST(request, { params }) {
  const Params = await params;
  try {
    // const facultyId = auth.user.id;
    const topicId = Number(Params.topicId);

    const { courseId, semesterId, academic_YearId, faculty_Id } =
      await request.json();
    const facultyId = Number(faculty_Id);
    const academicYearId = Number(academic_YearId);

    if (!topicId || !courseId || !semesterId || !academicYearId || !facultyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 🔍 check already marked
    const alreadyMarked = await prisma.topicCoverage.findFirst({
      where: {
        topicId,
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
    });

    if (alreadyMarked) {
      return NextResponse.json(
        { success: false, message: "Topic already marked" },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ create topic coverage
      await tx.topicCoverage.create({
        data: {
          topicId,
          facultyId,
          courseId,
          semesterId,
          academicYearId,
          taughtOn: new Date(),
        },
      });

      // 2️⃣ create subtopic coverages
      const subtopicIds = await getAllDescendantSubtopicIdsMark(tx, topicId);

      if (subtopicIds.length > 0) {
        await tx.subTopicCoverage.createMany({
          data: subtopicIds.map((id) => ({
            subtopicId: id,
            facultyId,
            courseId,
            semesterId,
            academicYearId,
            taughtOn: new Date(),
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Topic and subtopics marked successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to mark topic" },
      { status: 500 },
    );
  }
}

//For Unmark
export async function DELETE(request, { params }) {
  try {
    const Params = await params;
    const topicId = Number(Params.topicId);
    console.log(topicId);

    const { courseId, semesterId, academic_YearId, faculty_Id } =
      await request.json();
    const facultyId = Number(faculty_Id);
    const academicYearId = Number(academic_YearId);

    if (!topicId || !courseId || !semesterId || !academicYearId || !facultyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.topicCoverage.findFirst({
      where: {
        topicId,
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Topic is not marked" },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const subtopicIds = await getAllDescendantSubtopicIdsMark(tx, topicId);

      if (subtopicIds.length > 0) {
        await tx.subTopicCoverage.deleteMany({
          where: {
            subtopicId: { in: subtopicIds },
            facultyId,
            courseId,
            semesterId,
            academicYearId,
          },
        });
      }

      await tx.topicCoverage.deleteMany({
        where: {
          topicId,
          facultyId,
          courseId,
          semesterId,
          academicYearId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Topic and subtopics unmarked successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to unmark topic" },
      { status: 500 },
    );
  }
}
