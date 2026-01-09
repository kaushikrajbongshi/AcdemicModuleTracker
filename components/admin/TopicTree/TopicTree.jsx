"use client";
import { useState, useEffect } from "react";
import { ChevronDown, Plus, SquarePen, Trash2 } from "lucide-react";

export default function CourseTopicManager() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tree, setTree] = useState([]);
  const [courses, setcourses] = useState([]);
  const [showDelete, setshowDelete] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editNodeId, setEditNodeId] = useState(null);

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  const [showAddSubTopic, setShowAddSubTopic] = useState(false);
  const [newSubTopicName, setNewSubTopicName] = useState("");
  const [parentForSubTopic, setParentForSubTopic] = useState(null);
  const [topicForSubTopic, setTopicForSubTopic] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);

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

  const fetchTopicsByCourse = async (courseId) => {
    const res = await fetch(
      `/api/admin/topic/fetchAllTopic?courseId=${courseId}`,
      { cache: "no-store" }
    );
    const fetchedTopic = await res.json();

    const topicTree = fetchedTopic.result.map((t) => ({
      id: t.topic_id,
      name: t.topic_name,
      topicId: t.topic_id,
      type: "topic",
      isOpen: false,
      children: null,
    }));

    setTree(topicTree);
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);

    if (!courseId) {
      setTree([]);
      return;
    }

    await fetchTopicsByCourse(courseId);
  };

  // const handleCourseChange = async (e) => {
  //   const courseId = e.target.value;
  //   setSelectedCourse(courseId);

  //   if (!courseId) {
  //     setTree([]);
  //     return;
  //   }

  //   // const res = await fetch(
  //   //   `/api/admin/topic/fetchAllTopic?courseId=${courseId}`
  //   // );
  //   // const fetchedTopic = await res.json();

  //   // const topicTree = fetchedTopic.result.map((t) => ({
  //   //   id: t.topic_id,
  //   //   name: t.topic_name,
  //   //   topicId: t.topic_id,
  //   //   type: "topic",
  //   //   isOpen: false,
  //   //   children: null,
  //   // }));

  //   // setTree(topicTree);
  // };

  /* ================= FETCH SUBTOPICS ================= */
  const fetchSubTopics = async (topicId) => {
    const res = await fetch(
      `/api/admin/subtopic/fetchAllsubTopic?topicId=${topicId}`
    );
    const data = await res.json();
    return buildSubTree(data.result);
  };

  /* ================= BUILD SUBTREE ================= */
  const buildSubTree = (subtopics) => {
    const map = {};
    const roots = [];

    // 1️⃣ Create all nodes
    subtopics.forEach((st) => {
      map[st.subtopic_id] = {
        id: st.subtopic_id,
        name: st.subtopic_name,
        topicId: st.topicId,
        type: "subtopic", // ✅ important
        isOpen: false,
        children: [],
      };
    });

    // 2️⃣ Build hierarchy
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

  const openEditModal = (nodeId, currentName) => {
    setEditNodeId(nodeId);
    setEditValue(currentName);
    setShowEdit(true);
  };

  const handleEditConfirm = () => {
    const updateRecursively = (nodes) =>
      nodes.map((node) => {
        if (node.id === editNodeId) {
          return { ...node, name: editValue };
        }
        return { ...node, children: updateRecursively(node.children || []) };
      });

    setTree(updateRecursively(tree));
    setShowEdit(false);
    setEditNodeId(null);
    setEditValue("");
  };

  /* ================= DELETE NODE ================= */
  const deleteNode = (nodeId) => {
    setConfirmAction(() => () => {
      const deleteRecursively = (nodes) =>
        nodes
          .filter((node) => node.id !== nodeId)
          .map((node) => ({
            ...node,
            children: deleteRecursively(node.children || []),
          }));

      setTree(deleteRecursively(tree));
      setshowDelete(false);
    });
    setshowDelete(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
  };

  const handleCancel = () => {
    setshowDelete(false);
    setConfirmAction(null);
  };

  /* ================= ADD SUBTOPIC (UI ONLY) ================= */

  const openAddSubTopicModal = (node) => {
    setTopicForSubTopic(node.topicId);

    if (node.type === "topic") {
      setParentForSubTopic(null); // ✅ FIRST LEVEL
    } else {
      setParentForSubTopic(node.id); // ✅ NESTED
    }

    setNewSubTopicName("");
    setShowAddSubTopic(true);
  };

  const handleAddSubTopicConfirm = async () => {
    if (!newSubTopicName.trim()) return;

    try {
      const res = await fetch("/api/admin/subtopic/addSubTopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtopic_name: newSubTopicName,
          topicId: topicForSubTopic,
          parentId: parentForSubTopic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);

        alert(data.message || "Failed to add subtopic");
        return;
      }

      const addRecursively = (nodes) =>
        nodes.map((node) => {
          // ✅ FIRST-LEVEL SUBTOPIC (parent = topic)
          if (parentForSubTopic === null && node.id === topicForSubTopic) {
            return {
              ...node,
              isOpen: true,
              children: [
                ...(node.children || []),
                {
                  id: data.result.subtopic_id,
                  name: data.result.subtopic_name,
                  topicId: topicForSubTopic,
                  type: "subtopic",
                  isOpen: false,
                  children: [],
                },
              ],
            };
          }

          // ✅ NESTED SUBTOPIC
          if (node.id === parentForSubTopic) {
            return {
              ...node,
              isOpen: true,
              children: [
                ...(node.children || []),
                {
                  id: data.result.subtopic_id,
                  name: data.result.subtopic_name,
                  topicId: topicForSubTopic,
                  type: "subtopic",
                  isOpen: false,
                  children: [],
                },
              ],
            };
          }

          return {
            ...node,
            children: addRecursively(node.children || []),
          };
        });

      setTree(addRecursively(tree));

      setShowAddSubTopic(false);
      setTopicForSubTopic(null);
      setParentForSubTopic(null);
      setNewSubTopicName("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  //=============================================================
  /* ================= ADD TOPIC (UI ONLY) ================= */
  // const addTopic = () => {
  //   const name = prompt("Enter topic name");
  //   if (!name) return;

  //   setTree([
  //     ...tree,
  //     {
  //       id: Date.now(),
  //       name,
  //       isOpen: true,
  //       children: [],
  //     },
  //   ]);
  // };

  const openAddTopicModal = () => {
    setNewTopicName("");
    setShowAddTopic(true);
  };

  // const handleAddTopicConfirm = async () => {
  //   if (!newTopicName.trim()) return;

  //   try {
  //     // 🔹 1. API CALL
  //     console.log(selectedCourse);
  //     setTreeLoading(true);
  //     const res = await fetch("/api/admin/topic/addTopic", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         topic_name: newTopicName,
  //         courseId: selectedCourse,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       alert(data.message || "Failed to add topic");
  //       return;
  //     }
  //     await fetchTopicsByCourse(selectedCourse);

  //     // 🔹 2. UPDATE UI (simple & safe)
  //     setTree([
  //       ...tree,
  //       {
  //         id: data.result.topic_id,
  //         name: data.result.topic_name,
  //         isOpen: true,
  //         children: [],
  //       },
  //     ]);

  //     // 🔹 3. CLOSE MODAL
  //     setShowAddTopic(false);
  //     setNewTopicName("");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Something went wrong");
  //   } finally {
  //     setTreeLoading(false);
  //   }
  // };

  const handleAddTopicConfirm = async () => {
    if (!newTopicName.trim()) return;

    try {
      setTreeLoading(true); // 🔄 show spinner

      await fetch("/api/admin/topic/addTopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_name: newTopicName,
          courseId: selectedCourse,
        }),
      });

      // 🔁 reload tree from database
      await fetchTopicsByCourse(selectedCourse);

      setShowAddTopic(false);
      setNewTopicName("");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setTreeLoading(false); // ❌ hide spinner
    }
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
                openEditModal(node.id, node.name);
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
              {node.children &&
                node.children.map((child) => (
                  <div key={child.id} className="relative">
                    <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                    <TreeNode node={child} />
                  </div>
                ))}

              {/* Add Sub Topic (ALWAYS AVAILABLE) */}
              <div className="relative">
                <div className="absolute left-[-16px] top-[22px] w-4 h-px bg-gray-300" />
                <button
                  onClick={() => openAddSubTopicModal(node)}
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
    <>
      {treeLoading && (
        <div className="fixed inset-0 bg-white/60 z-[9999] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showDelete && (
        <div className="fixed inset-0 bg-[#f8f9fd]  flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border-2 border-gray-300 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-[#f8f9fd] flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border-2 border-gray-300 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Update Topic
            </h3>

            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleEditConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTopic && (
        <div className="fixed inset-0 bg-[#f8f9fd] flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border-2 border-gray-300 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add New Topic
            </h3>

            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Enter topic name"
              className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddTopic(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTopicConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSubTopic && (
        <div className="fixed inset-0 bg-[#f8f9fd] flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border-2 border-gray-300 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Sub Topic
            </h3>

            <input
              type="text"
              value={newSubTopicName}
              onChange={(e) => setNewSubTopicName(e.target.value)}
              placeholder="Enter sub topic name"
              className="w-full px-3 text-gray-900 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddSubTopic(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleAddSubTopicConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

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
                    onClick={openAddTopicModal}
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
                      onClick={openAddTopicModal}
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
    </>
  );
}
