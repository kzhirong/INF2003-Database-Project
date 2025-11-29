"use client";

import { useEffect, useState } from "react";
import NavbarClient from "@/components/NavbarClient";
import CCACard from "@/components/CCACard";
import EventCard from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MyCCA {
  id: string;
  title: string;
  category: string;
  memberStatus: string;
  upcomingEvent: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [myCCAs, setMyCCAs] = useState<MyCCA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchMyCCAs();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/");
      return;
    }

    setUser(user);

    // Fetch user details
    const { data, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !data) {
      console.error("Error fetching user data:", userError);
      router.push("/");
      return;
    }

    setUserData(data);

    // Redirect non-students
    if (data.role === "system_admin") {
      router.push("/admin");
    } else if (data.role === "cca_admin") {
      router.push(`/cca-admin/${data.cca_id}`);
    }
  };

  const fetchMyCCAs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enrollments/my-ccas');
      const data = await response.json();

      if (data.success && data.data) {
        const transformed = data.data.map((enrollment: any) => ({
          id: enrollment.cca?._id || enrollment.cca_id,
          title: enrollment.cca?.name || "Unknown CCA",
          category: enrollment.cca?.category || "General",
          memberStatus: "Member",
          upcomingEvent: enrollment.cca?.schedule?.[0]
            ? `${enrollment.cca.schedule[0].day}, ${enrollment.cca.schedule[0].startTime}, ${enrollment.cca.schedule[0].location}`
            : "No scheduled sessions"
        }));
        setMyCCAs(transformed);
      }
    } catch (error) {
      console.error('Error fetching CCAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const userFullName = userData?.name || "Student";
  const userEmail = user.email || "";
  const userInitials = getInitials(userData?.name);

  // TODO: Fetch enrolled CCAs from database when enrollment is implemented
  const myCCAs = [
    {
      title: "BASKETBALL",
      category: "Sports",
      memberStatus: "Member",
      upcomingEvent: "Monday, 6PM, Sports Hall",
    },
    {
      title: "HOCKEY",
      category: "Sports",
      memberStatus: "Member",
      upcomingEvent: "Tuesday, 6PM, Sports Hall",
    },
    {
      title: "FLOORBALL",
      category: "Sports",
      memberStatus: "Member",
      upcomingEvent: "Tuesday, 4PM, Sports Hall",
    },
  ];

  // Fetch upcoming events the user has registered for
  const { data: registeredEvents } = await supabase
    .from('attendance')
    .select(`
      event_id,
      events (
        id,
        cca_id,
        title,
        description,
        date,
        start_time,
        end_time,
        location,
        poster_url,
        max_attendees,
        status,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .gte('events.date', new Date().toISOString())
    .eq('events.status', 'published')
    .order('events.date', { ascending: true })
    .limit(3);

  // Transform the data to match EventWithDetails type
  const upcomingEvents = registeredEvents
    ?.map((record: any) => record.events)
    .filter((event: any) => event !== null)
    .map((event: any) => ({
      ...event,
      cca_name: 'CCA', // Will be enriched on client side if needed
      current_registrations: 0,
      spots_remaining: null,
      is_full: false,
      is_registered: true,
    })) || [];

  // Get the next upcoming event for the hero section
  const nextEvent = upcomingEvents[0] || null;

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <NavbarClient />

      {/* Main Content */}
      <main className="py-8">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <p className="text-sm md:text-base text-gray-600">
            <span className="text-black font-medium">HOME</span>
            <span className="mx-2">|</span>
            <span className="text-[#F44336] font-semibold">DASHBOARD OVERVIEW</span>
          </p>
        </div>

        {/* User Profile Section with Tab Navigation */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Profile Picture and User Info */}
            <div className="flex items-center gap-6">
              {/* Profile Picture - Placeholder with initials */}
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 flex-shrink-0">
                {userInitials}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-1">
                  {userFullName}
                </h2>
                <p className="text-base md:text-lg text-gray-600">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Right: Tab Navigation Buttons */}
            <div className="hidden md:flex items-center gap-8">
              <button className="px-6 py-2 text-xl font-semibold text-white bg-[#F44336] rounded-3xl hover:bg-[#d32f2f] transition-colors">
                Overview
              </button>
              <button className="px-6 py-2 text-xl font-medium text-black bg-white border-2 border-black rounded-3xl hover:bg-gray-50 transition-colors">
                My CCA&apos;s
              </button>
              <Link href="/events?filter=registered">
                <button className="px-6 py-2 text-xl font-medium text-black bg-white border-2 border-black rounded-3xl hover:bg-gray-50 transition-colors">
                  My Events
                </button>
              </Link>
              <button className="px-6 py-2 text-xl font-medium text-black bg-white border-2 border-black rounded-3xl hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div>
          <div className="bg-white p-8 md:p-12 lg:p-16 shadow-md">
            {/* Page Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F44336] mb-8">
              Your CCA Dashboard
            </h1>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - My CCAs and Upcoming Event */}
              <div className="lg:col-span-2 space-y-8">
                {/* My CCAs Section */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-black">
                      My CCAs
                    </h2>
                    <a
                      href="/ccas"
                      className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View All
                    </a>
                  </div>

                  {loading ? (
                    <div className="text-center text-gray-600 py-8">
                      Loading your CCAs...
                    </div>
                  ) : myCCAs.length === 0 ? (
                    <div className="text-center text-gray-600 py-8">
                      You haven&apos;t enrolled in any CCAs yet. Browse available CCAs to get started!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myCCAs.map((cca) => (
                        <CCACard
                          key={cca.id}
                          title={cca.title}
                          category={cca.category}
                          memberStatus={cca.memberStatus}
                          upcomingEvent={cca.upcomingEvent}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* My Registered Events Section */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-black">
                      My Registered Events
                    </h2>
                    <Link
                      href="/events?filter=registered"
                      className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View All
                    </Link>
                  </div>

                  {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingEvents.map((event) => (
                        <EventCard key={event.id} {...event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        You haven't registered for any events yet
                      </p>
                      <Link href="/events">
                        <button className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded hover:bg-[#d32f2f] transition-colors">
                          Browse Events
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - At a Glance and Quick Actions */}
              <div className="space-y-8">
                {/* At a Glance Section */}
                <div className="bg-white p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                    At a Glance
                  </h2>

                  <div className="space-y-4">
                    <div className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                        {myCCAs.length}
                      </div>
                      <div className="text-sm md:text-base text-gray-600">
                        Active CCA&apos;s
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                        {upcomingEvents.length}
                      </div>
                      <div className="text-sm md:text-base text-gray-600">
                        Upcoming Events
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-white p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                    Quick Actions
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push('/ccas')}
                      className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center"
                    >
                      Find new CCA
                    </button>
                    <Link href="/events">
                      <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center w-full">
                        Browse Events
                      </button>
                    </Link>
                    <Link href="/events?filter=registered">
                      <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center w-full">
                        View Registrations
                      </button>
                    </Link>
                    <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center">
                      Settings
                    </button>
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
