"use client";
import { useState } from "react";

export default function TopicTree() {
  // Dummy data (safe shape)
  const [tree, setTree] = useState([
    {
      id: 1,
      name: "Topic 1",
      isCompleted: false,
      children: [
        {
          id: 11,
          name: "Sub topic 1.1",
          isCompleted: false,
          children: [
            {
              id: 111,
              name: "Sub topic 1.1.1",
              isCompleted: false,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Topic 2",
      isCompleted: false,
      children: [],
    },
  ]);

  // 🔁 ADD SUBTOPIC (recursive)
  const addSubTopic = (parentId) => {
    const name = prompt("Enter sub topic name");
    if (!name) return;

    const addRecursively = (nodes) =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...node.children,
              {
                id: Date.now(),
                name,
                isCompleted: false,
                children: [],
              },
            ],
          };
        }

        return {
          ...node,
          children: addRecursively(node.children),
        };
      });

    setTree(addRecursively(tree));
  };

  // ➕ ADD TOPIC (root)
  const addTopic = () => {
    const name = prompt("Enter topic name");
    if (!name) return;

    setTree([
      ...tree,
      {
        id: Date.now(),
        name,
        isCompleted: false,
        children: [],
      },
    ]);
  };

  // 🌳 Recursive node UI
  const TreeNode = ({ node, level = 0 }) => {
    const [open, setOpen] = useState(true);

    return (
      <div className="relative pl-10 mt-4">
        {/* Vertical line (continuous) */}
        {level > 0 && (
          <span className="absolute left-4 top-0 h-full w-px bg-gray-400" />
        )}

        {/* Horizontal connector */}
        {level > 0 && (
          <span className="absolute left-4 top-6 w-6 h-px bg-gray-400" />
        )}

        {/* Node row */}
        <div className="flex items-center gap-2 relative">
          <div
            onClick={() => setOpen(!open)}
            className="border border-gray-300 px-4 py-2 rounded-md text-black bg-white cursor-pointer min-w-[220px]"
          >
            {node.name}
          </div>

          <button
            onClick={() => addSubTopic(node.id)}
            className="border border-gray-300 px-2 py-1 rounded text-black text-sm bg-white"
          >
            + Sub
          </button>
        </div>

        {/* Children */}
        {open &&
          node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-xl p-6 bg-white max-w-4xl">
      {/* COURSE HEADER (no tree) */}
      <div className="mb-8">
        <span className="border border-gray-300 px-4 py-2 rounded-md text-black font-medium">
          Course Name
        </span>
      </div>

      {/* TREE ONLY */}
      <div className="ml-6">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div className="mt-4 ml-16">
        <button
          onClick={addTopic}
          className="border border-gray-300 px-4 py-2 rounded-md text-black bg-white"
        >
          + Add Topic
        </button>
      </div>
    </div>
  );
}