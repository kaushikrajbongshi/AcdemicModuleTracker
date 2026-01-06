import { prisma } from "@/lib/prisma";

//add new course
export const createCourse = (data) => {
  return prisma.course.create({ data });
};
