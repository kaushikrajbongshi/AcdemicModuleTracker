import { prisma } from "@/lib/prisma";

//add new course
export const getAllDepartment = () => {
  return prisma.department.findMany();
};
