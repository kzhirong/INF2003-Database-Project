"use client";

import { useEffect, useState } from "react";
import NavbarClient from "@/components/NavbarClient";
import CCACard from "@/components/CCACard";
import EventCard from "@/components/EventCard";
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
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyCCAs();
      fetchUpcomingEvents();
    }
  }, [user]);

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
      .select("*, student_details(*)")
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
      // Get CCA ID from cca_admin_details
      const { data: adminData } = await supabase
        .from("cca_admin_details")
        .select("cca_id")
        .eq("user_id", user.id)
        .single();

      if (adminData?.cca_id) {
        router.push(`/cca-admin/${adminData.cca_id}`);
      }
    }
  };

  const fetchMyCCAs = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch memberships
      const { data: memberships, error } = await supabase
        .from("cca_membership")
        .select("cca_id")
        .eq("user_id", user.id);

      if (error) throw error;

      if (memberships && memberships.length > 0) {
        // Fetch CCA details from MongoDB
        const ccaPromises = memberships.map(async (membership) => {
          const response = await fetch(`/api/ccas/${membership.cca_id}`);
          const data = await response.json();
          return data.success ? data.data : null;
        });

        const ccasData = await Promise.all(ccaPromises);

        const transformed = ccasData
          .filter(cca => cca !== null)
          .map((cca: any) => ({
            id: cca._id,
            title: cca.name || "Unknown CCA",
            category: cca.category || "General",
            memberStatus: "Member",
            upcomingEvent: cca.schedule?.[0]
              ? `${cca.schedule[0].day}, ${cca.schedule[0].startTime}, ${cca.schedule[0].location}`
              : "No scheduled sessions"
          }));

        setMyCCAs(transformed);
      } else {
        setMyCCAs([]);
      }
    } catch (error) {
      console.error('Error fetching CCAs:', error);
      setMyCCAs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const supabase = createClient();

      // Fetch user's registered events
      const { data: attendanceRecords, error } = await supabase
        .from('attendance')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      if (attendanceRecords && attendanceRecords.length > 0) {
        // Filter out null event_ids (e.g. attendance for sessions)
        const eventIds = attendanceRecords
          .map(record => record.event_id)
          .filter(id => id !== null);

        if (eventIds.length === 0) {
          setUpcomingEvents([]);
          return;
        }

        // Fetch event details
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .gte('date', new Date().toISOString())
          .eq('status', 'published')
          .order('date', { ascending: true })
          .limit(3);

        if (eventsError) throw eventsError;

        setUpcomingEvents(events || []);
      } else {
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setUpcomingEvents([]);
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

  const userFullName = (userData.student_details as any)?.[0]?.name || userData.email || "Student";
  const userEmail = user.email || "";
  const userInitials = getInitials((userData.student_details as any)?.[0]?.name);

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

            {/* Right: Tab Navigation Buttons - Removed */}
            <div className="hidden md:flex items-center gap-8">
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
                    <Link
                      href="/ccas"
                      className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View All
                    </Link>
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
                        You haven&apos;t registered for any events yet
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
                        Active CCAs
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
