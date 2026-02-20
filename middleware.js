import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("LOGIN_INFO")?.value;

  // =========================
  // PUBLIC ROUTES
  // =========================
  if (
    pathname.startsWith("/login") ||
    pathname === "/" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // =========================
  // TOKEN CHECK
  // =========================
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: decoded } = await jwtVerify(token, secret);
    // Normalize role
    let actualRole;

    if (decoded.role === "admin") {
      actualRole = "admin";
    } else if (decoded.role === "faculty") {
      actualRole = decoded.faculty_role; // HOD or TEACHER
    } else {
      actualRole = decoded.role;
    }

    const roleLevels = {
      admin: 3,
      HOD: 2,
      TEACHER: 1,
    };

    const userLevel = roleLevels[actualRole] || 0;

    // =========================
    // DASHBOARD PAGE PROTECTION
    // =========================

    if (pathname.startsWith("/dashboard/admin")) {
      if (userLevel < roleLevels.admin) {
        return NextResponse.redirect(new URL("/login/admin", req.url));
      }
    }

    if (pathname.startsWith("/dashboard/faculty/hod")) {
      if (userLevel < roleLevels.HOD) {
        return NextResponse.redirect(new URL("/dashboard/faculty", req.url));
      }
    }

    if (pathname.startsWith("/dashboard/faculty")) {
      if (userLevel < roleLevels.TEACHER) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // =========================
    // API PROTECTION
    // =========================

    if (pathname.startsWith("/api/admin")) {
      if (userLevel < roleLevels.admin) {
        return NextResponse.json(
          { message: "Admin access required" },
          { status: 403 },
        );
      }
    }

    if (pathname.startsWith("/api/hod")) {
      if (userLevel < roleLevels.HOD) {
        return NextResponse.json(
          { message: "HOD access required" },
          { status: 403 },
        );
      }
    }

    if (pathname.startsWith("/api/faculty")) {
      if (userLevel < roleLevels.TEACHER) {
        return NextResponse.json(
          { message: "Faculty access required" },
          { status: 403 },
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/hod/:path*",
    "/api/faculty/:path*",
    "/api/common/:path*",
    "/api/course/:path*",
    "/api/departments/:path*",
    "/api/faculty_role/:path*",
    "/api/me/:path*",
    "/api/semester/:path*",
  ],
};
