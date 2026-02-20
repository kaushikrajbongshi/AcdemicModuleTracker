import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";

export async function PATCH(req) {
  try {

    
    const { yearId } = await req.json();

    if (!yearId) {
      return NextResponse.json(
        { error: "Academic year ID is required" },
        { status: 400 },
      );
    }

    // ensure year exists
    const year = await prisma.academicYear.findUnique({
      where: { id: yearId },
    });

    if (!year) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 },
      );
    }

    // atomic switch (MySQL-safe)
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.academicYear.update({
        where: { id: yearId },
        data: { isActive: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
