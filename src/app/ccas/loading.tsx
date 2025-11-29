export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Hero Section Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="h-12 w-80 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>

              {/* Search Bar */}
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg mb-6"></div>

              {/* Filter Sections */}
              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="mb-6">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-8 w-full bg-gray-100 animate-pulse rounded"></div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Clear Filters Button */}
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg mt-6"></div>
            </div>
          </div>

          {/* CCA Grid Skeleton */}
          <div className="lg:col-span-3">
            <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-5">
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                    <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 w-full bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
