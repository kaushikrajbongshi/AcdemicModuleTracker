"use client";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function MarkCourseTopic() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tree, setTree] = useState([]);
  const [courses, setcourses] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);

  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    node: null,
    action: "",
    affectedCount: 0,
  });

  // Refresh button animation state
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ================= FETCH COURSES ================= */
  const fetchCourse = async () => {
    const res = await fetch("/api/faculty/assigned-courses");
    const fetch_course = await res.json();
    setcourses(fetch_course.result);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  /* ================= FETCH TOPICS ================= */
  const fetchTopicsByCourse = async (courseId) => {
    try {
      const res = await fetch(
        `/api/faculty/fetchAllTopic?courseId=${courseId}`,
        { cache: "no-store" },
      );

      const fetchedTopic = await res.json();

      if (!res.ok || !fetchedTopic.success) {
        console.error("Failed to fetch topics:", fetchedTopic.message);
        setTree([]);
        return;
      }

      const topics = fetchedTopic.result || [];

      const status = await fetchMarkedStatus(courseId);

      const topicTree = topics.map((t) => ({
        id: t.topic_id,
        name: t.topic_name,
        topicId: t.topic_id,
        type: "topic",
        isOpen: false,
        isChecked: status?.markedTopics?.includes(t.topic_id) || false,
        children: null,
      }));

      setTree(topicTree);
    } catch (error) {
      console.error("Topic fetch error:", error);
      setTree([]);
    }
  };

  /* ================= Fetch marked topic and subtopic ================= */

  const fetchMarkedStatus = async (courseId) => {
    try {
      const res = await fetch(
        `/api/faculty/progress/topic/status?courseId=${courseId}`,
      );

      const data = await res.json();

      if (!res.ok) {
        return { markedTopics: [], markedSubtopics: [] };
      }

      return {
        markedTopics: data.markedTopics || [],
        markedSubtopics: data.markedSubtopics || [],
      };
    } catch (error) {
      console.error("Status fetch error:", error);
      return { markedTopics: [], markedSubtopics: [] };
    }
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

  /* ================= FETCH SUBTOPICS ================= */
  const fetchSubTopics = async (topicId) => {
    const res = await fetch(
      `/api/faculty/fetchAllsubTopic?topicId=${topicId}`,
    );
    const data = await res.json();

    const status = await fetchMarkedStatus(selectedCourse);

    return buildSubTree(data.result, status.markedSubtopics);
  };

  /* ================= BUILD SUBTREE ================= */
  const buildSubTree = (subtopics, markedSubtopics = []) => {
    const map = {};
    const roots = [];

    subtopics.forEach((st) => {
      map[st.subtopic_id] = {
        id: st.subtopic_id,
        name: st.subtopic_name,
        topicId: st.topicId,
        type: "subtopic",
        isOpen: false,
        isChecked: markedSubtopics.includes(st.subtopic_id), // ✅ FIX
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
    if (node.children === null) {
      node.children = await fetchSubTopics(node.id);
    }

    node.isOpen = !node.isOpen;
    setTree([...tree]);
  };

  /* ================= COUNT CHILDREN ================= */
  const countAllChildren = (node) => {
    if (!node.children || node.children.length === 0) return 0;

    let count = node.children.length;
    node.children.forEach((child) => {
      count += countAllChildren(child);
    });

    return count;
  };

  //Check if all subtopics are checked

  const areAllSubtopicsChecked = (node) => {
    if (!node.children || node.children.length === 0) return true;

    return node.children.every(
      (child) => child.isChecked && areAllSubtopicsChecked(child),
    );
  };

  const isAnySubtopicUnchecked = (node) => {
    if (!node.children || node.children.length === 0) return false;

    return node.children.some(
      (child) => !child.isChecked || isAnySubtopicUnchecked(child),
    );
  };

  const findParentTopic = (node, tree) => {
    for (const t of tree) {
      if (t.type === "topic") {
        if (findNode(t, node.id)) return t;
      }
    }
    return null;
  };

  const findNode = (current, targetId) => {
    if (current.id === targetId) return true;
    if (!current.children) return false;

    return current.children.some((c) => findNode(c, targetId));
  };

  //Statistics
  const countMarkedUnmarked = () => {
    let marked = 0;
    let unmarked = 0;

    const countRecursive = (nodes) => {
      nodes.forEach((node) => {
        if (node.isChecked) {
          marked++;
        } else {
          unmarked++;
        }
        if (node.children && node.children.length > 0) {
          countRecursive(node.children);
        }
      });
    };

    countRecursive(tree);
    return { marked, unmarked };
  };

  const stats = countMarkedUnmarked();

  /* ================= CHECKBOX HANDLER ================= */
  const handleCheckboxClick = async (node, e) => {
    e.stopPropagation();

    const willBeChecked = !node.isChecked;

    // Load children if not loaded yet (for topics)
    if (node.type === "topic" && node.children === null) {
      node.children = await fetchSubTopics(node.id);
      setTree([...tree]);
    }

    const affectedCount = node.type === "topic" ? countAllChildren(node) : 0;

    setConfirmationData({
      node: node,
      action: willBeChecked ? "check" : "uncheck",
      affectedCount: affectedCount,
    });

    setShowConfirmation(true);
  };

  //CheckBox handler for api call
  const callMarkApi = async (node, action) => {
    const isTopic = node.type === "topic";
    const url = isTopic
      ? `/api/faculty/progress/topic/${node.id}/mark`
      : `/api/faculty/progress/subtopic/${node.id}/mark`;

    const method = action === "check" ? "POST" : "DELETE";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourse,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Action failed");
    }
  };

  /* ================= CONFIRM CHECKBOX CHANGE ================= */
  const handleConfirmCheckbox = async () => {
    const { node, action } = confirmationData;
    const newCheckedState = action === "check";

    try {
      setTreeLoading(true);

      // 1️⃣ call backend for clicked node
      await callMarkApi(node, action);

      // 2️⃣ update clicked node + its children
      const updateNodeAndChildren = (targetNode) => {
        targetNode.isChecked = newCheckedState;
        if (targetNode.children) {
          targetNode.children.forEach(updateNodeAndChildren);
        }
      };
      updateNodeAndChildren(node);

      if (node.type === "subtopic") {
        const parentTopic = findParentTopic(node, tree);

        if (parentTopic) {
          // CASE A: all subtopics checked → auto mark topic
          if (areAllSubtopicsChecked(parentTopic) && !parentTopic.isChecked) {
            await callMarkApi(parentTopic, "check");
            parentTopic.isChecked = true;
          }

          // CASE B REMOVED: Don't auto-uncheck parent to avoid affecting sibling subtopics
          // The parent topic should only be automatically CHECKED when all subtopics are checked
          // If user wants to uncheck the parent, they should do it manually
        }
      }

      setTree([...tree]);
    } catch (err) {
      alert(err.message);
    } finally {
      setTreeLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelCheckbox = () => {
    setShowConfirmation(false);
  };

  /* ================= REFRESH HANDLER ================= */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTopicsByCourse(selectedCourse);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  /* ================= TREE NODE ================= */
  const TreeNode = ({ node, isLast = false }) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="relative">
        {/* Node Row */}
        <div className="inline-flex items-center justify-between gap-3 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition w-fit max-w-[320px]">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={node.isChecked}
            onChange={(e) => handleCheckboxClick(node, e)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />

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
        </div>

        {/* Children Container */}
        {node.isOpen && hasChildren && (
          <div className="ml-10 mt-3 relative">
            {/* Vertical line for children */}
            <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-gray-300" />

            <div className="space-y-3">
              {node.children.map((child, index) => (
                <div key={child.id} className="relative">
                  {/* Horizontal connector */}
                  <div className="absolute left-[-16px] top-[18px] w-4 h-px bg-gray-300" />
                  <TreeNode
                    node={child}
                    isLast={index === node.children.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* Checkbox Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-[#f8f9fd] flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border-2 border-gray-300 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmationData.action === "check" ? (
                <>
                  Are you sure you want to <strong>mark</strong> this{" "}
                  {confirmationData.node?.type}
                  {confirmationData.affectedCount > 0 && (
                    <>
                      {" "}
                      and all <strong>
                        {confirmationData.affectedCount}
                      </strong>{" "}
                      related subtopics
                    </>
                  )}
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to <strong>unmark</strong> this{" "}
                  {confirmationData.node?.type}
                  {confirmationData.affectedCount > 0 && (
                    <>
                      {" "}
                      and all <strong>
                        {confirmationData.affectedCount}
                      </strong>{" "}
                      related subtopics
                    </>
                  )}
                  ?
                </>
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCheckbox}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCheckbox}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  confirmationData.action === "check"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-[83vh] flex items-center justify-center bg-gray-50 p-6 overflow-hidden">
        <div
          className="bg-white rounded-lg border border-gray-300 shadow-lg flex overflow-hidden"
          style={{ width: "100vw", maxWidth: "100vw", height: "83vh" }}
        >
          {/* Left Side - Course Selection */}
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

              {selectedCourse && tree.length > 0 && (
                <div className="mt-8 w-full">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Statistics
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Marked:</span>
                        <span className="text-sm font-bold text-green-600">
                          {stats.marked}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Unmarked:</span>
                        <span className="text-sm font-bold text-orange-600">
                          {stats.unmarked}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-700">
                            Total:
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            {stats.marked + stats.unmarked}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Tree Container */}
          <div className="flex flex-col" style={{ width: "85vw" }}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Topics & Subtopics
              </h2>
              {selectedCourse && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-3 py-1 text-black rounded-lg hover:bg-gray-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-500"
                    style={{
                      transform: isRefreshing
                        ? "rotate(360deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto p-6">
              {!selectedCourse ? (
                <div className="text-center py-12 text-gray-500">
                  Please select a course to view topics
                </div>
              ) : tree.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No topics available for this course
                </div>
              ) : (
                <div className="relative ml-6">
                  {/* Main vertical line for all topics */}
                  <div className="absolute left-[-16px] top-[18px] bottom-0 w-px bg-gray-300" />

                  {tree.map((node, index) => (
                    <div key={node.id} className="relative mb-4">
                      {/* Horizontal connector for each topic */}
                      <div className="absolute left-[-16px] top-[18px] w-4 h-px bg-gray-300" />
                      <TreeNode
                        node={node}
                        isLast={index === tree.length - 1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
