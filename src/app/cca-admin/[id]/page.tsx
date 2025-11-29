"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import EventCard from "@/components/EventCard";
import SessionCard from "@/components/SessionCard";

interface CCAData {
  _id: string;
  name: string;
  category: string;
}

export default function CCAAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [loading, setLoading] = useState(true);
  const [ccaData, setCcaData] = useState<CCAData | null>(null);
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0 });

  useEffect(() => {
    fetchUserEmail();
    fetchCCAData();
    fetchEvents();
    fetchSessions();
    fetchMembers();
    fetchStats();
  }, [resolvedParams.id]);

  const fetchUserEmail = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
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
      const response = await fetch(`/api/events?cca_id=${resolvedParams.id}&limit=4`);
      const data = await response.json();

      if (data.success) {
        const upcoming = data.data.filter((event: any) =>
          new Date(event.date) >= new Date() && event.status === 'published'
        );
        setUpcomingEvents(upcoming.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions?cca_id=${resolvedParams.id}&limit=4`);
      const data = await response.json();

      if (data.success) {
        const upcoming = data.data.filter((session: any) =>
          new Date(session.date) >= new Date()
        );
        setUpcomingSessions(upcoming.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/memberships?cca_id=${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setMemberCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="py-8">
        {/* User Profile Section with Tab Navigation */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Profile Picture and User Info */}
            <div className="flex items-center gap-6">
              {/* Profile Picture - Placeholder with CCA initials */}
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 flex-shrink-0">
                {(() => {
                  const ccaName = ccaData?.name || 'CCA';
                  const names = ccaName.trim().split(' ');
                  if (names.length >= 2) {
                    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                  }
                  return ccaName.substring(0, 2).toUpperCase();
                })()}
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

            {/* Right: Tab Navigation Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                className="px-6 py-2 text-base font-semibold text-white bg-[#F44336] rounded-lg cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={() => router.push(`/cca-admin/${resolvedParams.id}/members`)}
                className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                My Members
              </button>
              <button
                onClick={() => router.push(`/cca-admin/${resolvedParams.id}/events`)}
                className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Events
              </button>
              <button
                onClick={() => router.push(`/cca-admin/${resolvedParams.id}/sessions`)}
                className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Sessions
              </button>
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
                      <EventCard key={event.id} {...event} />
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
                      className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors"
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
                      <SessionCard key={session.id} {...session} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No upcoming sessions</p>
                    <button
                      onClick={() => router.push(`/cca-admin/${resolvedParams.id}/sessions`)}
                      className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors"
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
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/cca-admin/${resolvedParams.id}/sessions`);
                    }}
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center"
                  >
                    Create Session
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/cca-admin/${resolvedParams.id}/members`);
                    }}
                    className="w-full bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center"
                  >
                    Manage Members
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}