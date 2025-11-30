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

        {/* Dashboard Content Skeleton */}
        <div>
          <div className="bg-white p-8 md:p-12 lg:p-16 shadow-md">
            <div className="h-12 w-96 bg-gray-200 animate-pulse rounded mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* My CCAs Section Skeleton */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events Section Skeleton */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* At a Glance Skeleton */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-[#F5F5F5] p-4 rounded-lg">
                        <div className="h-10 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Skeleton */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-6"></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
