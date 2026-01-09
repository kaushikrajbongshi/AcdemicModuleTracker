export async function getAllDescendantSubtopicIds(prisma, parentSubtopicId) {
  const children = await prisma.subTopic.findMany({
    where: { parentId: parentSubtopicId },
    select: { subtopic_id: true },
  });

  let ids = [];

  for (const child of children) {
    ids.push(child.subtopic_id);

    const deeperIds = await getAllDescendantSubtopicIds(
      prisma,
      child.subtopic_id
    );

    ids = ids.concat(deeperIds);
  }

  return ids;
}
