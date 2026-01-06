import { prisma } from "@/lib/prisma";

export const getAllSubTopic = async (data) => {
  const topicID = parseInt(data);
  console.log(topicID);
  return prisma.subTopic.findMany({
    where: { topicId: topicID },
  });
};
