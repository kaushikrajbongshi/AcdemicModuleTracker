import { prisma } from "@/lib/prisma";

export const getAllCourse = async () => {
  return await prisma.course.findMany();
};
