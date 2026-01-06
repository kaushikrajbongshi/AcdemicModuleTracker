import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { getAllDepartment } from "./departments.controller";

export async function GET(req) {
  // Role guard
  // const guard = await roleGuard(["admin"])(req);
  // if (guard) return guard;

  try {
    // Save faculty
    const result = await getAllDepartment();

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully Data fetch", result },
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
