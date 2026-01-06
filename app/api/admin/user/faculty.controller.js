import { prisma } from "@/lib/prisma";

// add new faculty
export const createFaculty = async (data) => {
  const {
    faculty_id,
    email,
    name,
    username,
    password,
    role,
  } = data;

  return prisma.faculty.create({
    data: {
      faculty_id,
      email,
      name,
      username,
      password,
      role: Number(role),
    },
  });
};
