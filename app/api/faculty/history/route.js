import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET(request) {
  console.log("hit");

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const facultyId = decoded.id;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
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

    // 2️⃣ Fetch SubTopic Coverage History
    const history = await prisma.subTopicCoverage.findMany({
      where: {
        facultyId,
        courseId,
        academicYearId: activeYear.id,
      },
      include: {
        subtopic: {
          include: {
            topic: {
              select: {
                topic_name: true,
              },
            },
          },
        },
        course: {
          select: {
            course_name: true,
          },
        },
        semester: {
          select: {
            semester_name: true,
          },
        },
      },
      orderBy: {
        taughtOn: "desc",
      },
    });

    // 3️⃣ Format Data for DataTable
    const formatted = history.map((item) => ({
      date: new Date(item.taughtOn).toLocaleDateString("en-GB"),
      course: item.course.course_name,
      semester: item.semester.semester_name,
      topic: item.subtopic.topic?.topic_name || "-",
      subtopic: item.subtopic.subtopic_name,
      remark: item.remark || "-",
    }));

    return NextResponse.json({
      success: true,
      result: formatted,
    });
  } catch (error) {
    console.error("Faculty history fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
