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

        {/* Members Content Skeleton */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Member Section Skeleton */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              </div>

              {/* Member List Skeleton */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex-1">
                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="h-10 w-16 bg-gray-300 animate-pulse rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
