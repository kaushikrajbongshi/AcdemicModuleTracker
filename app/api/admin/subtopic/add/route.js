import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { addSubTopic } from "./subtopic.controller";

export async function POST(req) {
  // Role guard
    const guard = await roleGuard(["admin"])(req);
    if (guard) return guard;

  // Get data
  const {
    subtopic_name,
    subtopic_description,
    topicId,
    isCompleted,
    remark,
    parentId,
    completedByFacultyId,
  } = await req.json();

  try {
    // Save faculty
    const result = await addSubTopic({
      subtopic_name,
      subtopic_description,
      isCompleted,
      remark,
      completedByFacultyId,
      parentId,
      topicId,
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
