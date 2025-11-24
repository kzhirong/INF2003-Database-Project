import NavbarClient from "@/components/NavbarClient";
import CCACard from "@/components/CCACard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // Fetch user details from public.users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userFullName = userData?.full_name || "Student";
  const userEmail = user.email || "";
  const userInitials = getInitials(userData?.full_name);

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
                My CCA's
              </button>
              <button className="px-6 py-2 text-xl font-medium text-black bg-white border-2 border-black rounded-3xl hover:bg-gray-50 transition-colors">
                My Events
              </button>
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
                      href="#"
                      className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      View All
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCCAs.map((cca, index) => (
                      <CCACard
                        key={index}
                        title={cca.title}
                        category={cca.category}
                        memberStatus={cca.memberStatus}
                        upcomingEvent={cca.upcomingEvent}
                      />
                    ))}
                  </div>
                </div>

                {/* Upcoming Event Section */}
                <div className="bg-white p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                    Upcoming Event
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Date Box */}
                    <div className="flex-shrink-0 bg-[#F5F5F5] p-6 text-center rounded-lg">
                      <div className="text-4xl md:text-5xl font-bold text-black">
                        Sept 24
                      </div>
                      <div className="text-sm md:text-base text-gray-600 mt-2">
                        Wednesday
                      </div>
                      <div className="text-sm md:text-base text-gray-600">
                        5PM
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow">
                      <p className="text-[#F44336] text-sm md:text-base font-semibold mb-2 uppercase">
                        Sports
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                        Run with Run Club
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4">
                        Track Field
                      </p>
                    </div>

                    {/* Details Button */}
                    <div className="flex-shrink-0 self-start">
                      <button className="px-6 py-2 bg-[#F44336] text-white font-semibold rounded hover:bg-[#d32f2f] transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
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
                        3
                      </div>
                      <div className="text-sm md:text-base text-gray-600">
                        Active CCA's
                      </div>
                    </div>

                    <div className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                        1
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
                    <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center">
                      Find new CCA
                    </button>
                    <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center">
                      Browse Events
                    </button>
                    <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center">
                      View Registrations
                    </button>
                    <button className="bg-[#F5F5F5] p-4 rounded-lg text-sm md:text-base font-medium text-black hover:bg-gray-200 transition-colors text-center">
                      Update Profile
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
