import { prisma } from "@/lib/prisma";

export const getAllFacultyRole = async () => {
  return await prisma.faculty_Role.findMany();
};
