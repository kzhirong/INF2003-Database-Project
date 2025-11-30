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

      <main className="py-0">
        {/* Hero Gallery Skeleton */}
        <section className="mb-10">
          <div className="h-96 bg-gray-200 animate-pulse"></div>
        </section>

        {/* CCA Data Section Skeleton */}
        <section className="mb-12 px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-full mx-auto mb-4"></div>
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mx-auto mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Cards Skeleton */}
        <section className="mb-10 px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events Skeleton */}
        <section className="mb-10 px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5">
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
