import { NextResponse } from "next/server";
import { roleGuard } from "@/utils/roleguard";
import { createDepartment } from "./add.controller";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  // 1. Role guard


  // 2. Get data
  const { dept_id, dept_name } = await req.json();
  console.log(dept_id, dept_name);

  try {
    if (!dept_name || !dept_id) {
      return NextResponse.json(
        { success: false, message: "Department name and deptID is required" },
        { status: 400 },
      );
    }

    // Check if already exists
    const existingDept = await prisma.department.findUnique({
      where: { dept_id },
    });

    if (existingDept) {
      return NextResponse.json(
        { success: false, message: "Department already exists" },
        { status: 409 },
      );
    }

    // 5. Save department
    const result = await createDepartment({
      dept_id,
      dept_name,
    });

    // 6. Return success
    return NextResponse.json(
      { success: true, message: "Successfully added Course", result },
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
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
