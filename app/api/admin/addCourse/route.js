import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { createCourse } from "./addCourse.controller";

export async function POST(req) {
  // 1. Role guard
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;

  // 2. Get data
  const { course_id, course_name, dept_id, semester_id } = await req.json();

  try {
    if (!dept_name || !course_id || !dept_id || !semester_id) {
      return NextResponse.json(
        { success: false, message: "All field is required" },
        { status: 400 },
      );
    }

    // Check if already exists
    const existingDept = await prisma.course.findUnique({
      where: { course_id },
    });

    if (existingDept) {
      return NextResponse.json(
        { success: false, message: "course already exists" },
        { status: 409 },
      );
    }

    // 5. Save faculty
    const result = await createCourse({
      course_id,
      course_name,
      dept_id,
      semester_id,
    });

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully added Course", result },
      { status: 200 },
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Course is already exists!" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
