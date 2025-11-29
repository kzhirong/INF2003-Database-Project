export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navbar Skeleton */}
      <nav className="bg-[#FAFBFD] px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </nav>

      <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-5 w-96 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Events Grid Skeleton */}
        <div>
          <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5">
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Past Events Section */}
          <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 opacity-60">
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
