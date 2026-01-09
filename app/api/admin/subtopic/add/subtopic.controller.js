import { prisma } from "@/lib/prisma";

//add new topic
export const addSubTopic = (data) => {
  return prisma.subTopic.create({ data });
};