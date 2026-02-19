import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function roleGuard(allowedRoles) {
  return async (req) => {
    try {
      const token = req.cookies.get("LOGIN_INFO")?.value;

      if (!token) {
        return NextResponse.json({ message: "Token missing" }, { status: 401 });
      }

      const decoded = verifyToken(token);

      // Normalize role
      let actualRole;

      if (decoded.role === "admin") {
        actualRole = "admin";
      } else if (decoded.role === "faculty") {
        actualRole = decoded.faculty_role; // HOD or TEACHER
      }

      //  Role hierarchy logic
      const roleLevels = {
        admin: 3,
        HOD: 2,
        TEACHER: 1,
      };

      const userLevel = roleLevels[actualRole] || 0;

      const isAllowed = allowedRoles.some(
        (role) => userLevel >= roleLevels[role],
      );

      if (!isAllowed) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      req.user = decoded;
      return null;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  };
}
