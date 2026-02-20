import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/utils/roleguard";

export async function POST(req) {
  try {
    const { label } = await req.json();

    if (!label) {
      return NextResponse.json(
        { error: "Academic year label is required" },
        { status: 400 },
      );
    }

    // strict format check
    const regex = /^\d{4}-\d{4}$/;
    if (!regex.test(label)) {
      return NextResponse.json(
        { error: "Format must be YYYY-YYYY" },
        { status: 400 },
      );
    }

    const [start, end] = label.split("-").map(Number);
    if (end !== start + 1) {
      return NextResponse.json(
        { error: "Academic year must be consecutive" },
        { status: 400 },
      );
    }

    const year = await prisma.academicYear.create({
      data: {
        label,
        isActive: false,
      },
    });

    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET
 * fetch all academic years
 */
export async function GET() {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      years,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
