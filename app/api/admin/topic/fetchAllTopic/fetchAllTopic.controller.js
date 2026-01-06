import { prisma } from "@/lib/prisma";

export const getAllTopic = async (courseId) => {
  console.log(courseId);

  return prisma.topic.findMany({
    where: { courseId },
  });
};
