import { prisma } from "@/lib/prisma";

export const getAllSemester = async () => {
  return await prisma.semester.findMany();
};
