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

{
  selectedCourse && tree.length > 0 && (
    <div className="mt-8 w-full">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Statistics</h3>
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
  );
}
