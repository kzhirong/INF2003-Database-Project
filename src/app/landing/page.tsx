import Navbar from "@/components/Navbar";
import PhotoGallery from "@/components/PhotoGallery";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="py-8">
        {/* Photo Gallery Section - Full Width */}
        <section className="mb-12">
          <PhotoGallery />
        </section>

        {/* Other Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <p className="text-[#000]">More content will go here...</p>
          </div>
        </div>
      </main>
    </div>
  );
}