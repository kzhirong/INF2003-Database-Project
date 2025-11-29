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

      <main className="py-8">
        {/* Breadcrumb Skeleton */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Event Hero */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register Button */}
              <div className="h-12 w-full bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
