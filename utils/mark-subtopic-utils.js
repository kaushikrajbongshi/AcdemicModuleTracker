export async function getAllDescendantSubtopicIdsMark(prisma, topicId) {
  // 1️⃣ fetch ALL subtopics of the topic at once
  const allSubtopics = await prisma.subTopic.findMany({
    where: { topicId },
    select: {
      subtopic_id: true,
      parentId: true,
    },
  });

  // 2️⃣ build adjacency map
  const childrenMap = {};
  for (const st of allSubtopics) {
    if (!childrenMap[st.parentId]) {
      childrenMap[st.parentId] = [];
    }
    childrenMap[st.parentId].push(st.subtopic_id);
  }

  // 3️⃣ DFS traversal
  const result = [];
  const visited = new Set();

  function dfs(parentId) {
    const children = childrenMap[parentId] || [];
    for (const childId of children) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      result.push(childId);
      dfs(childId);
    }
  }

  // null = first-level subtopics
  dfs(null);

  return result;
}

export async function getSubtopicWithDescendantsForSubtopic(prisma, rootSubtopicId) {
  const all = await prisma.subTopic.findMany({
    where: {},
    select: {
      subtopic_id: true,
      parentId: true,
    },
  });

  const map = {};
  for (const st of all) {
    if (!map[st.parentId]) map[st.parentId] = [];
    map[st.parentId].push(st.subtopic_id);
  }

  const result = [];
  const visited = new Set();

  function dfs(id) {
    if (visited.has(id)) return;
    visited.add(id);
    result.push(id);

    const children = map[id] || [];
    for (const child of children) {
      dfs(child);
    }
  }

  dfs(rootSubtopicId);
  return result;
}

