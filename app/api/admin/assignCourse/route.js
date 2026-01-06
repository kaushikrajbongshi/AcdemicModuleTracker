import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { courseAssign } from "./assignCourse.controller";

export async function POST(req) {
  // Role guard
  // const guard = await roleGuard(["admin"])(req);
  // if (guard) return guard;

  // Get data
  const { course_id, faculty_id } = await req.json();

  try {
    // Save faculty
    const result = await courseAssign({
      course_id,
      faculty_id,
    });

    if (!course_id || !faculty_id) {
      return NextResponse.json(
        { success: false, message: "courseId and facultyId are required" },
        { status: 400 }
      );
    }

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Coures Map Successfully", result },
      { status: 200 }
    );
  } catch (error) {

    //  DUPLICATE COURSE–FACULTY ASSIGNMENT
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "This course is already assigned to this faculty",
        },
        { status: 409 }
      );
    }

    // Foreign key violation (optional but useful)
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid course or faculty selected",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
