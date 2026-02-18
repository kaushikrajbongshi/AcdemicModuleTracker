import { prisma } from "@/lib/prisma";
import { convert_hash } from "@/utils/auth";

export const addFaculty = async (data) => {
  const { email, faculty_id, username, name, password, role, dept_id } = data;
  console.log("BODY:", data);
  if (
    !faculty_id ||
    !email ||
    !username ||
    !name ||
    !password ||
    !role ||
    !dept_id
  ) {
    throw new Error("All fields are required");
  }

  // Check if already exists
  const existingFacultyId = await prisma.faculty.findUnique({
    where: { faculty_id },
  });

  if (existingFacultyId) {
    throw new Error("Faculty ID already exists");
  }

  const existingEmail = await prisma.faculty.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await convert_hash(password);

  const newFaculty = await prisma.faculty.create({
    data: {
      faculty_id,
      email,
      username,
      name,
      password: hashedPassword,
      role: Number(role),
      dept_id,
    },
  });
  return newFaculty;
};
