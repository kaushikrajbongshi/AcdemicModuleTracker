import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { addTopic } from "./topic.controller";

export async function POST(req) {
  // Role guard
  // const guard = await roleGuard(["admin"])(req);
  // if (guard) return guard;

  // Get data
  const {
    topic_name,
    topic_description,
    courseId,
    isCompleted,
    remark,
    completedByFacultyId,
  } = await req.json();

  try {
    // Save faculty
    const result = await addTopic({
      topic_name,
      topic_description,
      courseId,
      isCompleted,
      remark,
      completedByFacultyId,
    });

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully added Topic", result },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Something went wrong!" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
