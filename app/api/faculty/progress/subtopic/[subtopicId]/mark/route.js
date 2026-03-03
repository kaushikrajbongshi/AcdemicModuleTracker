import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubtopicWithDescendantsForSubtopic } from "@/utils/mark-subtopic-utils";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";

/* ======================================================
   MARK SUBTOPIC (and ALL nested subtopics)
   ====================================================== */
export async function POST(request, { params }) {
  const Params = await params;
  try {
    const subtopicId = Number(Params.subtopicId);
    const { courseId } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const facultyId = Number(decoded.id);

    if (!subtopicId || !courseId || !facultyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1️⃣ Get active academic year
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

    // 2️⃣ Validate faculty assignment
    const assignment = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId,
        academicYearId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Unauthorized course access" },
        { status: 403 },
      );
    }

    // 3️⃣ Get semester from course (NOT from frontend)
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { semester_id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Invalid course" },
        { status: 400 },
      );
    }

    const semesterId = course.semester_id;

    const numericSubtopicId = Number(subtopicId);

    // 4️⃣ Get all descendant subtopics
    const ids = await getSubtopicWithDescendantsForSubtopic(
      prisma,
      numericSubtopicId,
    );

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
        await tx.subTopicCoverage.createMany({
          data: toCreate,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subtopic and all nested subtopics marked successfully",
    });
  } catch (error) {
    console.error("MARK SUBTOPIC ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark subtopic" },
      { status: 500 },
    );
  }
}

/* ======================================================
   UNMARK SUBTOPIC (and ALL nested subtopics)
   ====================================================== */
export async function DELETE(request, { params }) {
  const Params = await params;
  try {
    const subtopicId = Number(Params.subtopicId);
    const { courseId } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const facultyId = Number(decoded.id);

    if (!subtopicId || !courseId || !facultyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1️⃣ Get active academic year
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

    // 2️⃣ Validate faculty assignment
    const assignment = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId,
        academicYearId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Unauthorized course access" },
        { status: 403 },
      );
    }

    // 3️⃣ Get semester from course
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { semester_id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Invalid course" },
        { status: 400 },
      );
    }

    const semesterId = course.semester_id;

    const numericSubtopicId = Number(subtopicId);

    // 4️⃣ Get all descendant subtopics
    const ids = await getSubtopicWithDescendantsForSubtopic(
      prisma,
      numericSubtopicId,
    );

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
    console.error("UNMARK SUBTOPIC ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unmark subtopic" },
      { status: 500 },
    );
  }
}
