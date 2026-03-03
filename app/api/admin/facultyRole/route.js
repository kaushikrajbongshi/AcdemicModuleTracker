import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        facultyRole: true,
        department: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formatted = faculties.map((f) => ({
      id: f.id,
      faculty_id: f.faculty_id,
      name: f.name,
      email: f.email,
      role: f.facultyRole.description,
      status: f.status,
      department: f.department.dept_name,
    }));

    return NextResponse.json(
      { success: true, result: formatted },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const { facultyId, role, status } = await req.json();

    let updateData = {};

    // Change Role
    if (role) {
      const roleRecord = await prisma.faculty_Role.findFirst({
        where: { description: role },
      });

      if (!roleRecord) {
        return Response.json({ success: false, message: "Invalid role" });
      }

      updateData.role = roleRecord.id;
    }

    // Change Status
    if (status) {
      updateData.status = status; // "A" or "D"
    }

    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data: updateData,
    });

    return Response.json({ success: true, result: updated });
  } catch (error) {
    return Response.json({ success: false, message: error.message });
  }
}
