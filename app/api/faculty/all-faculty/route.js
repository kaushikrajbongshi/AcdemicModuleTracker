import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { getAllFaculty } from "./faculty.controller";

export async function GET(req) {



  try {
    // Save faculty
    const result = await getAllFaculty();

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
