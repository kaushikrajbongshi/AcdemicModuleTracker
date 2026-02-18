import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { addFaculty } from "./add.controller";

export async function POST(req) {
  // 1. Role guard
  // const guard = await roleGuard(["admin"])(req);
  // if (guard) return guard;

  // 2. Get data
  const body = await req.json();

  try {
    const newFaculty = await addFaculty(body);

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully added Course", newFaculty },
      { status: 200 },
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Depatment is already exists!" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 },
    );
  }
}
