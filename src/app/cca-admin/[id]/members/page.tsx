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

interface Member {
  id: string;
  name: string;
  student_id: string;
  year_of_study: number;
  course: string;
}

export default function CCAAdminMembers({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [loading, setLoading] = useState(true);
  const [ccaData, setCcaData] = useState<CCAData | null>(null);
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [studentId, setStudentId] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Placeholder data for members
  const [members] = useState<Member[]>([
    { id: "1", name: "James Wong Wen Jun", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "2", name: "James Lim Kai Xian", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "3", name: "James Sim Jun Kai", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "4", name: "James Kim", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "5", name: "James Lee", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "6", name: "John Wong", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "7", name: "John Wong", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "8", name: "Sam Wang", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "9", name: "Zac Lim", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
    { id: "10", name: "Zhong Wen Xian", student_id: "2402478", year_of_study: 1, course: "Applied Computing" },
  ]);

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

  const handleAddMember = async () => {
    if (!studentId.trim()) {
      alert("Please enter a student ID");
      return;
    }

    setAddingMember(true);
    // TODO: Implement actual API call to add member
    alert(`Adding student with ID: ${studentId}`);
    setStudentId("");
    setAddingMember(false);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the CCA?`)) {
      // TODO: Implement actual API call to remove member
      alert(`Removing member: ${memberName}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
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
              {/* Profile Picture - Placeholder */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
                  alt="CCA Admin"
                  className="w-full h-full object-cover"
                />
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
                onClick={() => router.push(`/cca-admin/${resolvedParams.id}`)}
                className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Overview
              </button>
              <button
                className="px-6 py-2 text-base font-semibold text-white bg-[#F44336] rounded-lg transition-colors cursor-pointer"
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

        {/* Members Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Add Members and Member List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Members Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-black mb-4">
                  Add Members
                </h2>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={addingMember}
                    className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#d32f2f] transition-colors disabled:opacity-50"
                  >
                    {addingMember ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              {/* Member List Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-black mb-4">
                  Member List
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Year</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Course</th>
                        <th className="text-left py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-900">{member.name}</td>
                          <td className="py-3 px-2 text-gray-600">{member.student_id}</td>
                          <td className="py-3 px-2 text-gray-600">Year {member.year_of_study}</td>
                          <td className="py-3 px-2 text-gray-600">{member.course}</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="px-4 py-1 bg-[#F44336] text-white text-sm font-semibold rounded hover:bg-[#d32f2f] transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {members.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No members yet</p>
                )}
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
                      {members.length || 89}
                    </div>
                    <div className="text-sm text-gray-600">
                      Active CCA's
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      2
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