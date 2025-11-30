import PhotoGallery from "@/components/PhotoGallery";
import CCADataSection from "@/components/CCADataSection";
import ServiceCard from "@/components/ServiceCard";
import EventCard from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Landing() {
  // Fetch upcoming published events
  const supabase = await createClient();
  const { data: eventsData } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(6);

  const upcomingEvents = eventsData || [];

  return (
    <>
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
        <section className="mb-10">
          <div className="px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {/* Top row - 3 cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ServiceCard
                    title="Sports"
                    description="Build physical fitness, teamwork, and competitive spirit through various athletic activities and tournaments"
                    image="/assets/cca-category-image/smc-1.jpg"
                    category="Sports"
                  />
                  <ServiceCard
                    title="Arts & Culture"
                    description="Express creativity through dance, music, theatre, and cultural performances that inspire and entertain"
                    image="/assets/cca-category-image/Performing-Arts-Nritya.jpg"
                    category="Arts & Culture"
                  />
                  <ServiceCard
                    title="Special Interest"
                    description="Join diverse interest groups and academic societies to explore passions and connect with like-minded peers"
                    image="/assets/cca-category-image/Performing-Arts-Pamc.jpg"
                    category="Special Interest"
                  />
                </div>

                {/* Bottom row - 2 cards centered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <ServiceCard
                    title="Community Service"
                    description="Develop leadership skills while making a positive impact on the community through service projects and initiatives"
                    image="/assets/cca-category-image/Performing-Arts-Breakers.jpg"
                    category="Community Service"
                  />
                  <ServiceCard
                    title="Academic"
                    description="Take on responsibilities in student governance and event organization to shape campus life and culture"
                    image="/assets/cca-category-image/smc-2.jpg"
                    category="Academic"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section with SVG Background */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12 relative overflow-hidden">
            {/* Background SVG */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src="/assets/upcoming-events-section.svg"
                alt=""
                className="w-9/10 h-auto object-contain opacity-100"
              />
            </div>

            <div className="relative px-4 sm:px-8 md:px-16 lg:px-24 py-12">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-black">
                    Featured Events
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {upcomingEvents.slice(0, 6).map((event: any) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      cca_name="CCA"
                      date={event.date}
                      start_time={event.start_time}
                      end_time={event.end_time}
                      location={event.location}
                      poster_url={event.poster_url}
                      max_attendees={event.max_attendees}
                      current_registrations={0}
                      spots_remaining={event.max_attendees}
                      is_full={false}
                      status={event.status}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/events">
                    <button className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors">
                      Browse All Events
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}