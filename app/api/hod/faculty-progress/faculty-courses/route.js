import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json(
        { message: "facultyId is required" },
        { status: 400 },
      );
    }

    const facultyCourses = await prisma.facultyCourse.findMany({
      where: {
        facultyId: Number(facultyId),
      },
      select: {
        course: {
          select: {
            course_id: true,
            course_name: true,
          },
        },
      },
    });

    const courses = facultyCourses.map((fc) => ({
      id: fc.course.course_id,
      name: fc.course.course_name,
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Faculty courses error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
