"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";

interface CCAData {
  _id: string;
  name: string;
  category: string;
  stats?: {
    currentMembers: number;
    maxMembers: number;
  };
}

export default function CCAAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [loading, setLoading] = useState(true);
  const [ccaData, setCcaData] = useState<CCAData | null>(null);
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase

  // Placeholder data for upcoming events
  const upcomingEvents = [
    { id: 1, title: "Hip Hop for You", time: "6PM", location: "Sports Hall" },
    { id: 2, title: "Hip Hop for James", time: "6PM", location: "Sports Hall" },
    { id: 3, title: "Hip Hop for Mochi", time: "6PM", location: "Sports Hall" },
    { id: 4, title: "Hip Hop for Luke", time: "6PM", location: "Sports Hall" },
  ];

  useEffect(() => {
    fetchUserEmail();
    fetchCCAData();
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
                onClick={() => router.push(`/ccas/${resolvedParams.id}/edit`)}
                className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upcoming Events */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-black">
                    Upcoming Events
                  </h2>
                  <button
                    className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Manage Events
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Placeholder Image */}
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-black mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.time}, {event.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Active Members Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                  Active Members
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      {ccaData?.stats?.currentMembers || 89}
                    </div>
                    <div className="text-sm text-gray-600">
                      Active CCA's
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      4
                    </div>
                    <div className="text-sm text-gray-600">
                      Upcoming Events
                    </div>
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