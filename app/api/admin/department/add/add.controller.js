import { prisma } from "@/lib/prisma";

//add new course
export const createDepartment = (data) => {
  return prisma.department.create({ data });
};
