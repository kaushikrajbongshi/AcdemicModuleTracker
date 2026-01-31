import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ======================================================
   MARK TOPIC (and ALL its subtopics)
   ====================================================== */
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
      // 1️⃣ mark topic
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

      // 2️⃣ fetch ALL subtopics of this topic (flat, includes nested)
      const subtopics = await tx.subTopic.findMany({
        where: { topicId },
        select: { subtopic_id: true },
      });

      // 3️⃣ mark ALL subtopics
      if (subtopics.length > 0) {
        await tx.subTopicCoverage.createMany({
          data: subtopics.map((id) => ({
            subtopicId: id.subtopic_id,

            facultyId,
            courseId,
            semesterId,
            academicYearId,
            taughtOn: new Date(),
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Topic and all subtopics marked successfully",
    });
  } catch (error) {
    console.error("MARK TOPIC ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark topic" },
      { status: 500 },
    );
  }
}

/* ======================================================
   UNMARK TOPIC (and ALL its subtopics)
   ====================================================== */
export async function DELETE(request, { params }) {
  const Params = await params;
  try {
    // const facultyId = auth.user.id;
    const topicId = Number(Params.topicId);

    const { courseId, semesterId, academic_YearId, faculty_Id } =
      await request.json();
    console.log(
      "c",
      courseId,
      "s",
      semesterId,
      "a",
      academic_YearId,
      "f",
      faculty_Id,
    );
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
      // 1️⃣ fetch ALL subtopics of this topic
      const subtopics = await tx.subTopic.findMany({
        where: { topicId },
        select: { subtopic_id: true },
      });

      // 2️⃣ unmark subtopics
      if (subtopics.length > 0) {
        await tx.subTopicCoverage.deleteMany({
          where: {
            subtopicId: { in: subtopics.map((s) => s.subtopic_id) },
            facultyId,
            courseId,
            semesterId,
            academicYearId,
          },
        });
      }

      // 3️⃣ unmark topic
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
      message: "Topic and all subtopics unmarked successfully",
    });
  } catch (error) {
    console.error("UNMARK TOPIC ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unmark topic" },
      { status: 500 },
    );
  }
}
