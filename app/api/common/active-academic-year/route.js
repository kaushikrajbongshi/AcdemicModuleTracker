import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const year = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!year) {
      return NextResponse.json(
        { success: false, message: "No active academic year set" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      year,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

//
// const activeYear = await prisma.academicYear.findFirst({
//   where: { isActive: true },
// });

// if (!activeYear) {
//   throw new Error("Academic year not configured");
// }

// use activeYear.id internally
