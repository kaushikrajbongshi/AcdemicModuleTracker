import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";

export async function GET() {
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

    // 1️⃣ Active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { message: "Active academic year not found" },
        { status: 400 },
      );
    }

    const academicYearId = academicYear.id;

    // 2️⃣ Faculty courses
    const facultyCourses = await prisma.facultyCourse.findMany({
      where: {
        facultyId,
        academicYearId,
      },
      include: {
        course: {
          select: {
            course_id: true,
            course_name: true,
          },
        },
      },
    });

    if (facultyCourses.length === 0) {
      return NextResponse.json([]);
    }

    // 3️⃣ Build course-wise progress
    const result = await Promise.all(
      facultyCourses.map(async (fc) => {
        const courseId = fc.course.course_id;

        // total subtopics in this course
        const totalSubtopics = await prisma.subTopic.count({
          where: {
            topic: {
              courseId,
            },
          },
        });

        // completed subtopics in this course
        const completedSubtopics = await prisma.subTopicCoverage.count({
          where: {
            facultyId,
            academicYearId,
            courseId,
          },
        });

        const progress =
          totalSubtopics === 0
            ? 0
            : Math.round((completedSubtopics / totalSubtopics) * 100);

        return {
          courseId,
          courseName: fc.course.course_name,
          totalSubtopics,
          completedSubtopics,
          progress,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Course-wise progress error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
