import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { convert_hash } from "@/utils/auth";
import { createFaculty } from "./faculty.controller";
import { createStudent } from "./student.controller";

export async function POST(req) {
  // 1. Role guard
  const guard = await roleGuard(["admin"])(req);
  if (guard) return guard;

  // 2. Get data
  const {
    faculty_id,
    studentID,
    email,
    name,
    username,
    password,
    currentSem,
    season,
    userType,
    role,
  } = await req.json();

  try {
    // 3. Validate
    if (!["faculty", "student"].includes(userType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid userType, must be either 'faculty' or 'student'",
        },
        { status: 400 },
      );
    }

    // 4. Hash password
    const hashPassword = await convert_hash(password);

    if (userType === "faculty") {
      // 5. Save faculty
      const result = await createFaculty({
        faculty_id,
        email,
        name,
        username,
        password: hashPassword,
        role,
      });

      // 6. Return success
      return NextResponse.json(
        { success: true, message: "Successfully added faculty", result },
        { status: 200 },
      );
    }

    if (userType === "student") {
      // 5. Save student
      const result = await createStudent({
        studentID,
        email,
        password: hashPassword,
        currentSem,
        season,
      });

      // 6. Return success
      return NextResponse.json(
        { success: true, message: "Successfully added faculty", result },
        { status: 200 },
      );
    }
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email already exists!" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
