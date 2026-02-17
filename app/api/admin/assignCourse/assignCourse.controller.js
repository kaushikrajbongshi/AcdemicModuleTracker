import { prisma } from "@/lib/prisma";

export const courseAssign = ({ course_id, faculty_id, academicYearId }) => {
  return prisma.facultyCourse.create({
    data: {
      facultyId: Number(faculty_id),
      courseId: course_id,
      academicYearId: Number(academicYearId),
    },
  });
};
