import { prisma } from "@/lib/prisma";

export const getAllFaculty = async () => {
  return await prisma.faculty.findMany({
    omit: {
      password: true,
      email: true,
      status: true,
    },
  });
};
