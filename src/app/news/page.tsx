import NavbarClient from "@/components/NavbarClient";
import NewsCard from "@/components/NewsCard";

export default function News() {
  const newsItems = [
    {
      id: "run-with-run-club-1",
      category: "Sports",
      title: "Run with Run Club",
      date: "Sat, 24 Sept, 17:00",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
    {
      id: "run-with-run-club-2",
      category: "Sports",
      title: "Run with Run Club",
      date: "Sat, 24 Sept, 17:00",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
    {
      id: "run-with-run-club-3",
      category: "Sports",
      title: "Run with Run Club",
      date: "Sat, 24 Sept, 17:00",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <NavbarClient />

      {/* Main Content */}
      <main className="py-8">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm md:text-base text-gray-600">
              <span className="text-black font-medium">HOME</span>
              <span className="mx-2">|</span>
              <span className="text-[#F44336] font-semibold">NEWS</span>
            </p>
          </div>
        </div>

        {/* News Cards Section */}
        <section>
          <div className="px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-6">
                {newsItems.map((item, index) => (
                  <NewsCard
                    key={index}
                    id={item.id}
                    category={item.category}
                    title={item.title}
                    date={item.date}
                    description={item.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
