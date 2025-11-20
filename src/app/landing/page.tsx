import NavbarClient from "@/components/NavbarClient";
import PhotoGallery from "@/components/PhotoGallery";
import CCADataSection from "@/components/CCADataSection";
import ServiceCard from "@/components/ServiceCard";
import EventCarousel from "@/components/EventCarousel";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <NavbarClient />

      {/* Main Content */}
      <main className="py-0">
        {/* Photo Gallery Section - Full Width */}
        <section className="mb-10">
          <PhotoGallery />
        </section>

        {/* CCA Data Section */}
        <section className="mb-12">
          <CCADataSection />
        </section>

        {/* Service Cards Section */}
        <section className="mb-20">
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

        {/* Upcoming Events Section */}
        <section className="mb-12 relative overflow-hidden">
          {/* Background SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/assets/upcoming-events-section.svg"
              alt=""
              className="w-9/10 h-auto object-contain opacity-100"
            />
          </div>

          {/* Content */}
          <div className="relative px-4 sm:px-8 md:px-16 lg:px-24 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <h2 className="text-4xl md:text-5xl font-bold text-[#000] mb-8 text-center">
                Upcoming Events
              </h2>

              {/* Event Carousel */}
              <EventCarousel
                events={[
                  {
                    title: "INTER-HALL GAMES 2024",
                    description: "Join us for the annual Inter-Hall Games featuring basketball, soccer, and badminton competitions among residential halls",
                    image: "/assets/cca-category-image/smc-1.jpg",
                  },
                  {
                    title: "CULTURAL NIGHT",
                    description: "Experience a vibrant showcase of diverse cultures through traditional dances, music performances, and authentic cuisine",
                    image: "/assets/cca-category-image/Performing-Arts-Nritya.jpg",
                  },
                  {
                    title: "HACKATHON 2024",
                    description: "24-hour coding challenge where students collaborate to build innovative tech solutions for real-world problems",
                    image: "/assets/cca-category-image/Performing-Arts-Pamc.jpg",
                  },
                  {
                    title: "COMMUNITY SERVICE DAY",
                    description: "Make a difference in the community through volunteering activities at local charities and community centers",
                    image: "/assets/cca-category-image/Performing-Arts-Breakers.jpg",
                  },
                  {
                    title: "LEADERSHIP SUMMIT",
                    description: "Develop your leadership potential through workshops, networking sessions, and inspiring talks from industry leaders",
                    image: "/assets/cca-category-image/smc-2.jpg",
                  },
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}