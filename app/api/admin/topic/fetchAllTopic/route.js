import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { getAllTopic } from "./fetchAllTopic.controller";

export async function GET(req) {
  // Role guard
  const guard = await roleGuard(["TEACHER"])(req);
  if (guard) return guard;
  
  // Get URL object
  const { searchParams } = new URL(req.url);

  // Read query param
  const courseId = searchParams.get("courseId");

  if (!courseId || courseId.trim() === "") {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  try {
    const result = await getAllTopic(courseId);
    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully Data fetch", result },
      { status: 200 },
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Something went wrong!" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
