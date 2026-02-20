import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/auth";
import { roleGuard } from "@/utils/roleguard";

export async function GET() {
  try {


    const cookieStore = await cookies();
    const token = cookieStore.get("LOGIN_INFO")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = verifyToken(token);

    const user = await prisma.faculty.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        facultyRole: {
          select: { description: true },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
