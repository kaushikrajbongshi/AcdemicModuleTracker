import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // 🔥 Clear the auth cookie
  cookieStore.set("LOGIN_INFO", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
