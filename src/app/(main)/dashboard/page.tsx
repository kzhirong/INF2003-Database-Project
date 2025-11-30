"use client";

import { useEffect, useState } from "react";
import CCACard from "@/components/CCACard";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import { getUserData } from "@/lib/auth";

interface MyCCA {
  id: string;
  title: string;
  category: string;
  memberStatus: string;
  upcomingEvent: string;
  image?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [myCCAs, setMyCCAs] = useState<MyCCA[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();

    // Check for success message in URL
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success) {
      if (success === 'image') {
        setSuccessMessage("Profile image updated successfully!");
      } else if (success === 'password') {
        setSuccessMessage("Password updated successfully!");
      }

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // OPTIMIZATION: Run fetches in parallel for faster page load
      Promise.all([
        fetchMyCCAs(),
        fetchUpcomingEvents()
      ]).catch(error => {
        console.error('Error loading dashboard:', error);
      });
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

    // Fetch user details using centralized function
    const data = await getUserData();

    if (!data) {
      console.error("Error fetching user data");
      router.push("/");
      return;
    }

    setUserData(data);

    // Redirect non-students
    if (data.role === "system_admin") {
      router.push("/admin");
    } else if (data.role === "cca_admin") {
      if (data.cca_id) {
        router.push(`/cca-admin/${data.cca_id}`);
      }
    }
  };

  const handleProfileUpdate = (type: 'image' | 'password') => {
    // Use Next.js router for smoother updates and to avoid "window.location" issues in modals
    router.push(`/dashboard?success=${type}`);
    router.refresh();
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
        // Collect all CCA IDs
        const ccaIds = memberships.map(m => m.cca_id).join(',');

        // Fetch all CCA details from MongoDB in one batch request
        const response = await fetch(`/api/ccas?ids=${ccaIds}`);
        const data = await response.json();
        
        const ccasData = data.success ? data.data : [];
        
        const transformed = ccasData.map((cca: any) => ({
            id: cca._id,
            title: cca.name || "Unknown CCA",
            category: cca.category || "General",
            memberStatus: "Member",
            upcomingEvent: cca.schedule?.[0]
              ? `${cca.schedule[0].day}, ${cca.schedule[0].startTime}, ${cca.schedule[0].location}`
              : "No scheduled sessions",
            image: cca.profileImage
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
        const eventIds = attendanceRecords
          .map((record) => record.event_id)
          .filter((id) => id !== null);

        if (eventIds.length > 0) {
          // Fetch enriched event details from API
          const response = await fetch(`/api/events?ids=${eventIds.join(',')}&upcoming=true&limit=3`);
          const result = await response.json();

          if (result.success) {
            setUpcomingEvents(result.data);
          } else {
            console.error('Failed to fetch events:', result.error);
            setUpcomingEvents([]);
          }
        } else {
          setUpcomingEvents([]);
        }
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

  const userFullName = userData.name || userData.email || "Student";
  const userEmail = user.email || "";
  const userInitials = getInitials(userData.name);

  return (
    <>
      {/* Success Message Banner */}
      {successMessage && (
        <div className="bg-green-100 border-b border-green-200 text-green-800 px-4 py-3 text-center">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

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
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-1">
                  {userFullName}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-base md:text-lg text-gray-600">
                    {userEmail}
                  </p>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    title="Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
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
                      className="px-4 py-2 bg-[#F44336] text-white text-sm font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors flex items-center gap-2"
                    >
                      View All CCAs
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
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
                          id={cca.id}
                          title={cca.title}
                          category={cca.category}
                          memberStatus={cca.memberStatus}
                          upcomingEvent={cca.upcomingEvent}
                          image={cca.image}
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
                      className="px-4 py-2 bg-[#F44336] text-white text-sm font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors flex items-center gap-2"
                    >
                      View All Events
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
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
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}

