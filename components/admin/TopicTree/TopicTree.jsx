"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Plus, SquarePen, Trash2 } from "lucide-react";

export default function CourseTopicManager() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tree, setTree] = useState([]);
  const [courses, setcourses] = useState([]);

  /* ================= FETCH COURSES ================= */
  const fetchCourse = async () => {
    const res = await fetch("/api/course");
    const fetch_course = await res.json();
    setcourses(fetch_course.result);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  /* ================= FETCH TOPICS ================= */
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);

    if (!courseId) {
      setTree([]);
      return;
    }

    const res = await fetch(
      `/api/admin/topic/fetchAllTopic?courseId=${courseId}`
    );
    const fetchedTopic = await res.json();

    // 🔑 IMPORTANT: children = null (not loaded yet)
    const topicTree = fetchedTopic.result.map((t) => ({
      id: t.topic_id,
      name: t.topic_name,
      isOpen: false,
      children: null,
    }));

    setTree(topicTree);
  };

  /* ================= FETCH SUBTOPICS ================= */
  const fetchSubTopics = async (topicId) => {
    const res = await fetch(`/api/admin/subtopic/fetchAllsubTopic?topicId=${topicId}`);
    const data = await res.json();
    return buildSubTree(data.result);
  };

  /* ================= BUILD SUBTREE ================= */
  const buildSubTree = (subtopics) => {
    const map = {};
    const roots = [];

    subtopics.forEach((st) => {
      map[st.subtopic_id] = {
        id: st.subtopic_id,
        name: st.subtopic_name,
        isOpen: false,
        children: [],
      };
    });

    subtopics.forEach((st) => {
      if (st.parentId !== null) {
        map[st.parentId]?.children.push(map[st.subtopic_id]);
      } else {
        roots.push(map[st.subtopic_id]);
      }
    });

    return roots;
  };

  /* ================= TOGGLE NODE (LAZY LOAD) ================= */
  const toggleNode = async (node) => {
    // lazy load subtopics ONLY ON FIRST EXPAND
    if (node.children === null) {
      node.children = await fetchSubTopics(node.id);
    }

    node.isOpen = !node.isOpen;
    setTree([...tree]);
  };

  /* ================= EDIT NODE ================= */
  const editNode = (nodeId) => {
    const name = prompt("Enter new name");
    if (!name) return;

    const updateRecursively = (nodes) =>
      nodes.map((node) => {
        if (node.id === nodeId) return { ...node, name };
        return { ...node, children: updateRecursively(node.children || []) };
      });

    setTree(updateRecursively(tree));
  };

  /* ================= DELETE NODE ================= */
  const deleteNode = (nodeId) => {
    if (!confirm("Are you sure you want to delete?")) return;

    const deleteRecursively = (nodes) =>
      nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => ({
          ...node,
          children: deleteRecursively(node.children || []),
        }));

    setTree(deleteRecursively(tree));
  };

  /* ================= ADD SUBTOPIC (UI ONLY) ================= */
  const addSubTopic = (parentId) => {
    const name = prompt("Enter sub topic name");
    if (!name) return;

    const addRecursively = (nodes) =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            isOpen: true,
            children: [
              ...(node.children || []),
              {
                id: Date.now(),
                name,
                isOpen: false,
                children: [],
              },
            ],
          };
        }
        return { ...node, children: addRecursively(node.children || []) };
      });

    setTree(addRecursively(tree));
  };

  /* ================= ADD TOPIC (UI ONLY) ================= */
  const addTopic = () => {
    const name = prompt("Enter topic name");
    if (!name) return;

    setTree([
      ...tree,
      {
        id: Date.now(),
        name,
        isOpen: true,
        children: [],
      },
    ]);
  };

  /* ================= TREE NODE ================= */
  const TreeNode = ({ node }) => {
    return (
      <div className="relative mb-3">
        {/* ================= Node Row ================= */}
        <div className="group inline-flex items-center justify-between gap-3 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition w-fit max-w-[320px]">
          {/* Toggle */}
          <button
            onClick={() => toggleNode(node)}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {node.name}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                node.isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Hover Edit / Delete */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                editNode(node.id);
              }}
              className="p-1 rounded hover:bg-blue-100"
              title="Edit"
            >
              <SquarePen className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className="p-1 rounded hover:bg-red-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* ================= Children + Add Sub Topic ================= */}
        <div
          className={`ml-10 mt-3 relative grid transition-[grid-template-rows,opacity,transform] duration-300 ${
            node.isOpen
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-1"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="overflow-hidden">
            {/* Vertical connector */}
            {node.isOpen && (
              <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-gray-300" />
            )}

            <div className="space-y-2 pl-6">
              {/* Recursive children */}
              {node.children && node.children.map((child) => (
                <div key={child.id} className="relative">
                  <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                  <TreeNode node={child} />
                </div>
              ))}

              {/* Add Sub Topic (ALWAYS AVAILABLE) */}
              <div className="relative">
                <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                <button
                  onClick={() => addSubTopic(node.id)}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600"
                >
                  Add Sub topic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="h-[83vh] flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
      {/* Single Rectangle Container */}
      <div
        className="bg-white rounded-lg border border-gray-300 shadow-lg flex overflow-hidden"
        style={{ width: "100vw", maxWidth: "100vw", height: "83vh" }}
      >
        {/* Left Side - Course Selection (15vw) */}
        <div
          className="border-r border-gray-300 p-6 flex flex-col items-center"
          style={{ width: "15vw", minWidth: "15vw" }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Course
          </h2>
          <div>
            <select
              id="course"
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side - Tree Container (85vw with scroll) */}
        <div className="flex flex-col" style={{ width: "85vw" }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Topics & Subtopics
            </h2>
          </div>

          {/* Scrollable Tree Area - both vertical and horizontal scroll */}
          <div className="flex-1 overflow-auto p-6">
            {!selectedCourse ? (
              <div className="text-center py-12 text-gray-500">
                Please select a course to view topics
              </div>
            ) : tree.length === 0 ? (
              <div className="relative ml-6 mt-6">
                {/* Add Topic ONLY (blank start state) */}
                <button
                  onClick={addTopic}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Add Topic
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative ml-6">
                <div className="absolute left-[-16px] top-4 bottom-4 w-px bg-gray-300" />

                {tree.map((node) => (
                  <div key={node.id} className="relative mb-4">
                    <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                    <TreeNode node={node} />
                  </div>
                ))}

                {/* Add Topic */}
                <div className="relative mt-4">
                  <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                  <button
                    onClick={addTopic}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Add Topic
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}