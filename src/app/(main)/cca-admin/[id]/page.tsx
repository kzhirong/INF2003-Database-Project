"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import SessionCard from "@/components/SessionCard";
import Image from "next/image";

interface CCAData {
  _id: string;
  name: string;
  category: string;
  profileImage?: string;
}

export default function CCAAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [loading, setLoading] = useState(true);
  const [ccaData, setCcaData] = useState<CCAData | null>(null);
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0 });

  useEffect(() => {
    // OPTIMIZATION: Run all fetches in parallel for faster page load
    Promise.all([
      fetchUserData(),
      fetchCCAData(),
      fetchEvents(),
      fetchSessions(),
      fetchStats()
    ]).catch(error => {
      console.error('Error loading dashboard data:', error);
    });
  }, [resolvedParams.id]);

  const fetchUserData = async () => {
    try {
      const { getUserData } = await import("@/lib/auth");
      const userData = await getUserData();
      
      if (userData?.email) {
        setUserEmail(userData.email);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/cca-admin/${resolvedParams.id}/members`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCCAData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ccas/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setCcaData(data.data);
      } else {
        alert("Failed to load CCA data");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching CCA:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // Use upcoming=true to let the server filter for us
      const response = await fetch(`/api/events?cca_id=${resolvedParams.id}&limit=4&upcoming=true`);
      const data = await response.json();

      if (data.success) {
        setUpcomingEvents(data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      // Use upcoming=true to let the server filter for us
      const response = await fetch(`/api/sessions?cca_id=${resolvedParams.id}&limit=4&upcoming=true`);
      const data = await response.json();

      if (data.success) {
        setUpcomingSessions(data.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="py-8">
        {/* User Profile Section with Tab Navigation */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Profile Picture and User Info */}
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
                {ccaData?.profileImage ? (
                  <Image
                    src={ccaData.profileImage}
                    alt={ccaData.name || 'CCA Profile'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-3xl font-bold text-gray-600">
                    {(() => {
                      const ccaName = ccaData?.name || 'CCA';
                      const names = ccaName.trim().split(' ');
                      if (names.length >= 2) {
                        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                      }
                      return ccaName.substring(0, 2).toUpperCase();
                    })()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-1">
                  {ccaData?.name || 'CCA ADMIN'}
                </h2>
                <p className="text-base md:text-lg text-gray-600">
                  {userEmail || 'Loading...'}
                </p>
              </div>
            </div>

            {/* Right: Tab Navigation Buttons - Moved to Navbar */}
            <div className="hidden md:flex items-center gap-4">
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upcoming Events & Sessions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Events */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Upcoming Events
                  </h2>
                  <button
                    onClick={() => router.push(`/cca-admin/${resolvedParams.id}/events`)}
                    className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Manage Events
                  </button>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcomingEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        {...event} 
                        href={`/cca-admin/${resolvedParams.id}/events/${event.id}/attendance`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No upcoming events</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/cca-admin/${resolvedParams.id}/events/create`);
                      }}
                      className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer"
                    >
                      Create Event
                    </button>
                  </div>
                )}
              </div>

              {/* Sessions */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Upcoming Sessions
                  </h2>
                  <button
                    onClick={() => router.push(`/cca-admin/${resolvedParams.id}/sessions`)}
                    className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Manage Sessions
                  </button>
                </div>

                {upcomingSessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {upcomingSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        {...session}
                        clickable={true}
                        onClick={() =>
                          router.push(
                            `/cca-admin/${resolvedParams.id}/sessions/${session.id}/attendance`
                          )
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No upcoming sessions</p>
                    <button
                      onClick={() => router.push(`/cca-admin/${resolvedParams.id}/sessions/create`)}
                      className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer"
                    >
                      Create Session
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Quick Stats Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                  Quick Stats
                </h2>

                <div className="space-y-4">
                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      {stats.totalMembers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Active Members
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      {upcomingEvents.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Upcoming Events
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      {upcomingSessions.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Upcoming Sessions
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/cca-admin/${resolvedParams.id}/events/create`);
                    }}
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center cursor-pointer"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/cca-admin/${resolvedParams.id}/sessions/create`);
                    }}
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center cursor-pointer"
                  >
                    Create Session
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/cca-admin/${resolvedParams.id}/members`);
                    }}
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center cursor-pointer"
                  >
                    Manage Members
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}