export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
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
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div>
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-5 w-64 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="h-7 w-48 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
