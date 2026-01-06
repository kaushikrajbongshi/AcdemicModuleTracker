import { prisma } from "@/lib/prisma";

export const getAllDepartment = async () => {
  return await prisma.department.findMany();
};
