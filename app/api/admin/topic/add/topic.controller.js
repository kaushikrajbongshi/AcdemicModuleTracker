import { prisma } from "@/lib/prisma";

//add new topic
export const addTopic = (data) => {
  return prisma.topic.create({ data });
};