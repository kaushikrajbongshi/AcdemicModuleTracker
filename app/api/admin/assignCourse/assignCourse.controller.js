import { prisma } from "@/lib/prisma";

export const courseAssign = (data) => {
  return prisma.facultyCourse.create({
    data: {
      facultyId: Number(data.faculty_id),
      courseId: data.course_id,
    },
  });
};
