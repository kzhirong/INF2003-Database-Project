export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navbar Skeleton */}
      <nav className="bg-[#FAFBFD] px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        {/* Profile Section Skeleton */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div>
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-5 w-64 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Analytics Content Skeleton */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-3"></div>
                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
            <div className="h-80 bg-gray-100 animate-pulse rounded flex items-center justify-center">
              <div className="text-gray-400">Loading chart...</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
