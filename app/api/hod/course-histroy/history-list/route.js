import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const facultyId = Number(searchParams.get("facultyId"));
    const courseId = searchParams.get("courseId");
    const academicYearId = Number(searchParams.get("academicYearId"));

    if (!facultyId || !courseId || !academicYearId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // ============================================
    // VERIFY TOKEN
    // ============================================

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const hodId = decoded.id;

    // ============================================
    // VERIFY HOD ROLE
    // ============================================

    const hod = await prisma.faculty.findUnique({
      where: { id: hodId },
      select: {
        id: true,
        dept_id: true,
        facultyRole: {
          select: { description: true },
        },
      },
    });

    if (!hod || hod.facultyRole.description !== "HOD") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // ============================================
    // VERIFY FACULTY SAME DEPARTMENT
    // ============================================

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { dept_id: true },
    });

    if (!faculty || faculty.dept_id !== hod.dept_id) {
      return NextResponse.json(
        { success: false, message: "Faculty not in your department" },
        { status: 403 }
      );
    }

    // ============================================
    // VERIFY FACULTY COURSE ASSIGNMENT
    // ============================================

    const assignment = await prisma.facultyCourse.findFirst({
      where: {
        facultyId,
        courseId,
        academicYearId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Invalid course assignment" },
        { status: 403 }
      );
    }

    // ============================================
    // GET COURSE SEMESTER
    // ============================================

    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { semester_id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Invalid course" },
        { status: 400 }
      );
    }

    const semesterId = course.semester_id;

    // ============================================
    // FETCH SUBTOPIC HISTORY (MAIN TEACHING DATA)
    // ============================================

    const subtopicHistory = await prisma.subTopicCoverage.findMany({
      where: {
        facultyId,
        courseId,
        semesterId,
        academicYearId,
      },
      include: {
        subtopic: {
          select: {
            subtopic_name: true,
            topic: {
              select: {
                topic_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        taughtOn: "desc",
      },
    });

    // ============================================
    // FORMAT RESPONSE FOR DATATABLE
    // ============================================

    const result = subtopicHistory.map((s) => ({
      date: s.taughtOn,
      topic: s.subtopic.topic.topic_name,
      subtopic: s.subtopic.subtopic_name,
      remark: s.remark ?? "",
    }));

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("HOD HISTORY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch history" },
      { status: 500 }
    );
  }
}