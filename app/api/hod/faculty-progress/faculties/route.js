import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    /**
     * TEMP: replace later with session-based HOD
     * Example: const hodDeptId = session.user.departmentId
     */
    const hodDeptId = "CSE";

    const faculties = await prisma.faculty.findMany({
      where: {
        facultyCourses: {
          some: {
            course: {
              dept_id: hodDeptId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ["id"], 
    });

    return NextResponse.json({
      success: true,
      faculties,
    });
  } catch (error) {
    console.error("HOD faculty fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
