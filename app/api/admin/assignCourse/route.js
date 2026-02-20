import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";
import { courseAssign } from "./assignCourse.controller";

export async function POST(req) {
  // Role guard

  try {
    const { course_id, faculty_id } = await req.json();

    // 1️⃣ Validate first
    if (!course_id || !faculty_id) {
      return NextResponse.json(
        { success: false, message: "courseId and facultyId are required" },
        { status: 400 },
      );
    }

    // 2️⃣ Get active academic year
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

    // 3️⃣ Assign course with academicYearId
    const result = await courseAssign({
      course_id,
      faculty_id,
      academicYearId: activeYear.id,
    });

    return NextResponse.json(
      { success: true, message: "Course mapped successfully", result },
      { status: 200 },
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This course is already assigned to this faculty for this academic year",
        },
        { status: 409 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid course or faculty selected",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
