import { prisma } from "@/lib/prisma";
//add new student
export const createStudent = (data) => {
  return prisma.student.create({ data });
};
