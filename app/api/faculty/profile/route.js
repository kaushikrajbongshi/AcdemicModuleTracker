import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
    // -----------------------------
    // VERIFY TOKEN
    // -----------------------------

    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    const facultyId = decoded.id;

    // -----------------------------
    // FETCH FACULTY PROFILE
    // -----------------------------

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: {
        faculty_id: true,
        name: true,
        username: true,
        email: true,
        status: true,
        created_at: true,

        facultyRole: {
          select: {
            description: true,
          },
        },

        department: {
          select: {
            dept_name: true,
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 },
      );
    }

    // -----------------------------
    // FORMAT RESPONSE
    // -----------------------------

    const result = {
      facultyId: faculty.faculty_id,
      name: faculty.name,
      username: faculty.username,
      email: faculty.email,
      role: faculty.facultyRole.description,
      department: faculty.department.dept_name,
      status: faculty.status === "A" ? "Active" : "Inactive",
      joinedDate: faculty.created_at,
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
