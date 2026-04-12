const CardSkeleton = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-7 bg-gray-200 rounded w-28" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 h-72"><div className="h-full bg-gray-200 rounded-lg" /></div>
      <div className="card p-6 h-72"><div className="h-full bg-gray-200 rounded-lg" /></div>
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-100" />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b border-gray-50">
        <div className="h-4 bg-gray-200 rounded w-1/5" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/6" />
        <div className="h-4 bg-gray-200 rounded w-1/6" />
        <div className="h-4 bg-gray-200 rounded w-1/8" />
      </div>
    ))}
  </div>
);

export { CardSkeleton, DashboardSkeleton, TableSkeleton };
