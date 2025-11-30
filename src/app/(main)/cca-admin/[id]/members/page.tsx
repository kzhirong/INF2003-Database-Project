"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CCAData {
  _id: string;
  name: string;
  category: string;
  profileImage?: string;
}

interface Member {
  enrollment_id: string;
  user_id: string;
  name: string;
  student_id: string;
  course_name: string;
  phone_number: string;
  created_at: string;
}

export default function CCAAdminMembers({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [loading, setLoading] = useState(true);
  const [ccaData, setCcaData] = useState<CCAData | null>(null);
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [studentId, setStudentId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // OPTIMIZATION: Run all fetches in parallel for faster page load
    Promise.all([
      fetchUserData(),
      fetchCCAData(),
      fetchMembers()
    ]).catch(error => {
      console.error('Error loading members page:', error);
    });
  }, [resolvedParams.id]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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

  const fetchCCAData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ccas/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setCcaData(data.data);
      } else {
        setError('Failed to load CCA data');
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching CCA:", error);
      setError('An error occurred while loading CCA data');
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/cca-admin/${resolvedParams.id}/members`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.data);
        setStats(data.stats);
      } else {
        setError('Failed to load members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('An error occurred while loading members');
    }
  };

  const handleAddMember = async () => {
    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }

    // Validate format (7 digits)
    if (!/^\d{7}$/.test(studentId.trim())) {
      setError('Student ID must be exactly 7 digits');
      return;
    }

    setAddingMember(true);
    try {
      const response = await fetch(`/api/cca-admin/${resolvedParams.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId.trim() })
      });
      const data = await response.json();

      if (data.success) {
        setStudentId("");
        fetchMembers(); // Refresh list
        setSuccess('Member added successfully!');
      } else {
        setError(data.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the CCA?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cca-admin/${resolvedParams.id}/members/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        fetchMembers(); // Refresh list
        setSuccess(`${memberName} removed successfully`);
      } else {
        setError(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      setError('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
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

        {/* Members Content */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={addingMember}
                    className="px-6 py-2 text-base bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#d32f2f] transition-colors disabled:opacity-50 cursor-pointer"
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
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Student ID</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Course</th>
                        <th className="text-left py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.enrollment_id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-900">{member.name}</td>
                          <td className="py-3 px-2 text-gray-600">{member.student_id}</td>
                          <td className="py-3 px-2 text-gray-600">{member.course_name}</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleRemoveMember(member.user_id, member.name)}
                              className="px-4 py-1 bg-[#F44336] text-white text-sm font-semibold rounded hover:bg-[#d32f2f] transition-colors cursor-pointer"
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
              {/* Quick Stats Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                  Quick Stats
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                      {stats.totalMembers}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Members
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
    </>
  );
}