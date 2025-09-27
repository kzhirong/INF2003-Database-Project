import Navbar from "@/components/Navbar";
import PhotoGallery from "@/components/PhotoGallery";
import CCADataSection from "@/components/CCADataSection";
import ServiceCard from "@/components/ServiceCard";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="py-5">
        {/* Photo Gallery Section - Full Width */}
        <section className="mb-12">
          <PhotoGallery />
        </section>

        {/* CCA Data Section */}
        <section className="mb-12">
          <CCADataSection />
        </section>

        {/* Service Cards Section */}
        <section className="mb-12">
          <div className="px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {/* Top row - 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ServiceCard
                    title="SPORTS"
                    description="Build physical fitness, teamwork, and competitive spirit through various athletic activities and tournaments"
                    image="/assets/cca-category-image/smc-1.jpg"
                  />
                  <ServiceCard
                    title="PERFORMING ARTS"
                    description="Express creativity through dance, music, theatre, and cultural performances that inspire and entertain"
                    image="/assets/cca-category-image/Performing-Arts-Nritya.jpg"
                  />
                  <ServiceCard
                    title="CLUBS & SOCIETIES"
                    description="Join diverse interest groups and academic societies to explore passions and connect with like-minded peers"
                    image="/assets/cca-category-image/Performing-Arts-Pamc.jpg"
                  />
                </div>

                {/* Bottom row - 2 cards centered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <ServiceCard
                    title="LEADERSHIP & SERVICE"
                    description="Develop leadership skills while making a positive impact on the community through service projects and initiatives"
                    image="/assets/cca-category-image/Performing-Arts-Breakers.jpg"
                  />
                  <ServiceCard
                    title="STUDENT MANAGEMENT"
                    description="Take on responsibilities in student governance and event organization to shape campus life and culture"
                    image="/assets/cca-category-image/smc-2.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}