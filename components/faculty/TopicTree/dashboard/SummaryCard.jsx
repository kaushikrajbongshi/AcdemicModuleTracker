// components/dashboard/SummaryCards.jsx
export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Overall Progress" value="68%" footer>
        <div className="mt-3 h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full w-[68%]" />
        </div>
      </Card>

      <Card title="Total Topics" value="24" subtitle="Across all courses" />
      <Card title="Completed Topics" value="16" subtitle="Fully covered" />
      <Card title="Pending Topics" value="8" subtitle="In progress" />
    </div>
  );
}

function Card({ title, value, subtitle, footer, children }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
      {footer && children}
    </div>
  );
}
