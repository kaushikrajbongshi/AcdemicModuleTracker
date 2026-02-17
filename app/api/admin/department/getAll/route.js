import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { getAllDepartment } from "./getall.controller";

export async function GET(req) {
  // 1. Role guard
  // const guard = await roleGuard(["admin"])(req);
  // if (guard) return guard;

  try {
    const result = await getAllDepartment();

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully fetch department", result },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
