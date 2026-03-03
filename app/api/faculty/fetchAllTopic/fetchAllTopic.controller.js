import { prisma } from "@/lib/prisma";

export const getAllTopic = async (courseId) => {
  return prisma.topic.findMany({
    where: { courseId },
  });
};
