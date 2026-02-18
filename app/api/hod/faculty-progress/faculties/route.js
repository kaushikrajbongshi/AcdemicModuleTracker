import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (decoded.faculty_role !== "HOD") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ Get HOD's dept_id from DB
    const hod = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: { dept_id: true },
    });

    if (!hod) {
      return NextResponse.json({ message: "HOD not found" }, { status: 404 });
    }

    // ✅ Filter directly by dept_id
    const faculties = await prisma.faculty.findMany({
      where: {
        dept_id: hod.dept_id,
        status: "A",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ success: true, faculties });
  } catch (error) {
    console.error("HOD faculty fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}