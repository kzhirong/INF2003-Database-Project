"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import BlockEditor from "@/components/BlockEditor";
import TimePicker from "@/components/TimePicker";
import { Block } from "@/types/blocks";

export default function EditCCAPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [userRole, setUserRole] = useState(""); // Store user role for permission checking

  // Fixed/Required fields
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState(""); // Store original name for display
  const [category, setCategory] = useState("Sports");
  const [schedule, setSchedule] = useState<Array<{
    day: string;
    startTime: string;
    endTime: string;
    location: string;
  }>>([]);
  const [commitment, setCommitment] = useState("Schedule Based");
  const [sportType, setSportType] = useState("Competitive");

  // Hero section
  const [heroImage, setHeroImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Dynamic content blocks
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch existing CCA data on mount
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
        
        // Get user role for permission checking
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (userData?.role) {
          setUserRole(userData.role);
        }
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
        const cca = data.data;
        setName(cca.name || "");
        setOriginalName(cca.name || ""); // Store original name for header/email display
        setCategory(cca.category || "Sports");
        setSchedule(cca.schedule || []);
        setCommitment(cca.commitment || "Schedule Based");
        setSportType(cca.sportType || "Competitive");
        setHeroImage(cca.heroImage || "");
        setShortDescription(cca.shortDescription || "");
        setBlocks(cca.blocks || []);
      } else {
        alert("Failed to load CCA data");
        router.push("/ccas");
      }
    } catch (error) {
      console.error("Error fetching CCA:", error);
      alert("Error loading CCA");
      router.push("/ccas");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const categories = ["Sports", "Arts & Culture", "Academic", "Community Service", "Special Interest"];
  const commitmentTypes = ["Schedule Based", "Flexible", "Event Based"];
  const sportTypes = ["Competitive", "Recreational", "Both"];

  const handleScheduleToggle = (day: string) => {
    setSchedule((prev) => {
      const existingIndex = prev.findIndex(s => s.day === day);
      if (existingIndex >= 0) {
        // Remove the day
        return prev.filter(s => s.day !== day);
      } else {
        // Add the day with default time (12:00 PM - 1:00 PM)
        return [...prev, { day, startTime: '12:00', endTime: '13:00', location: '' }];
      }
    });
  };

  const updateScheduleSession = (day: string, field: 'startTime' | 'endTime' | 'location', value: string) => {
    setSchedule((prev) =>
      prev.map(s => s.day === day ? { ...s, [field]: value } : s)
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Validation: Check if Schedule Based is selected but no days are chosen
      if (commitment === "Schedule Based" && schedule.length === 0) {
        setError("Please select at least one day for the schedule.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Auto-dismiss validation error after 5 seconds
        setTimeout(() => {
          setError("");
        }, 5000);
        setSaving(false);
        return;
      }

      // Validation: Check if all schedule entries have time and location filled
      if (commitment === "Schedule Based") {
        const incompleteSchedule = schedule.find(
          s => !s.startTime || !s.endTime || !s.location
        );
        if (incompleteSchedule) {
          setError(`Please fill in start time, end time, and location for ${incompleteSchedule.day}.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Auto-dismiss validation error after 5 seconds
          setTimeout(() => {
            setError("");
          }, 5000);
          setSaving(false);
          return;
        }

        // Validation: Check if start time is before end time
        const invalidTimeSchedule = schedule.find(
          s => s.startTime >= s.endTime
        );
        if (invalidTimeSchedule) {
          setError(`Start time must be before end time for ${invalidTimeSchedule.day}.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Auto-dismiss validation error after 5 seconds
          setTimeout(() => {
            setError("");
          }, 5000);
          setSaving(false);
          return;
        }
      }

      // Build the CCA data object
      const ccaData: any = {
        _id: resolvedParams.id,
        heroImage,
        shortDescription,
        blocks
      };

      // Structural fields (System Admin only)
      if (userRole === 'system_admin') {
        ccaData.name = name;
        ccaData.category = category;
      }

      // Sport Type (Editable by both System Admin and CCA Admin if category is Sports)
      if (category === "Sports") {
        ccaData.sportType = sportType;
      } else {
        ccaData.sportType = null;
      }

      // Commitment and Schedule (Editable by both System Admin and CCA Admin)
      ccaData.commitment = commitment;
      if (commitment === "Schedule Based") {
        ccaData.schedule = schedule;
      } else {
        ccaData.schedule = null;
      }

      const response = await fetch(`/api/ccas/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ccaData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Changes saved successfully!");
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (userRole === 'system_admin') {
          // System admin: redirect to CCA detail page after 1.5s
          setTimeout(() => {
            router.push(`/ccas/${resolvedParams.id}`);
          }, 1500);
        } else {
          // CCA admin: auto-dismiss success message after 3 seconds
          setTimeout(() => {
            setSuccess("");
          }, 3000);
        }
      } else {
        setError(data.error || "Failed to save changes");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Auto-dismiss error after 5 seconds for both roles
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error: any) {
      console.error("Error saving CCA:", error);
      setError(error.message || "Failed to save changes");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Auto-dismiss error after 5 seconds for both roles
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CCA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="py-8">
        {/* Header Section */}
        {/* Header Section */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          {userRole === 'system_admin' ? (
            <>
              {/* Tab Navigation (Replicated from Admin Dashboard) */}
              <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Register Student
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Register CCA Admin
                </button>
                <button
                  className="px-6 py-3 font-semibold text-[#F44336] border-b-2 border-[#F44336] transition-colors whitespace-nowrap"
                >
                  Manage CCAs
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Manage CCA: {name || 'Loading...'}</h1>
                  <p className="text-gray-600 mt-1">Edit CCA details and settings</p>
                </div>
                {/* Back button removed as per request */}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-6">
              {/* Left: Profile Picture and User Info */}
              <div className="flex items-center gap-6">
                {/* Profile Picture - Placeholder with CCA initials */}
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 flex-shrink-0">
                  {(() => {
                    const ccaName = originalName || 'CCA';
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
                    {originalName || 'CCA ADMIN'}
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
                  onClick={() => router.push(`/cca-admin/${resolvedParams.id}/members`)}
                  className="px-6 py-2 text-base font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  My Members
                </button>
                <button
                  className="px-6 py-2 text-base font-semibold text-white bg-[#F44336] rounded-lg transition-colors cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Page Header for CCA Admin */}
          {userRole !== 'system_admin' && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Manage CCA</h1>
              <p className="text-gray-600 mt-1">Customize how students view your CCA page and manage your schedule</p>
            </div>
          )}

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

          <div className="space-y-8">
            {/* Fixed Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Required Information
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                These fields are required for filtering and categorization
              </p>

              <div className="space-y-6">
                {/* CCA Name */}
                {userRole === 'cca_admin' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CCA Name *
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-between">
                      <span>{originalName}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Read-only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact System Admin to change</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CCA Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                      placeholder="e.g., BASKETBALL"
                    />
                  </div>
                )}

                {/* Category */}
                {userRole === 'cca_admin' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Read-only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact System Admin to change</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setCategory(newCategory);
                        // Reset sportType to default if changing away from Sports
                        if (newCategory !== "Sports") {
                          setSportType("Competitive");
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sport Type (conditional - directly under Category since they're related) */}
                {category === "Sports" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sport Type *
                    </label>
                    <select
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {sportTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Commitment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commitment Type *
                    </label>
                    <select
                      value={commitment}
                      onChange={(e) => {
                        const newCommitment = e.target.value;
                        setCommitment(newCommitment);
                        // Clear schedule if changing to Flexible or Event Based
                        if (newCommitment !== "Schedule Based") {
                          setSchedule([]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {commitmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                {/* Schedule (conditional - only show when Schedule Based) */}
                {commitment === "Schedule Based" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Schedule *
                    </label>
                    <div className="space-y-4">
                      {/* Day Selection Buttons */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {daysOfWeek.map((day) => {
                          const isSelected = schedule.some(s => s.day === day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleScheduleToggle(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F44336] text-white border-[#F44336]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Days Forms */}
                      <div className="space-y-4">
                        {daysOfWeek.map((day) => {
                          const session = schedule.find(s => s.day === day);
                          if (!session) return null;

                          return (
                            <div key={day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#F44336] rounded-full"></span>
                                {day}
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Start Time *
                                    </label>
                                    <TimePicker
                                      value={session.startTime}
                                      onChange={(val) => updateScheduleSession(day, 'startTime', val)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      End Time *
                                    </label>
                                    <TimePicker
                                      value={session.endTime}
                                      onChange={(val) => updateScheduleSession(day, 'endTime', val)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Location *
                                  </label>
                                  <input
                                    type="text"
                                    value={session.location}
                                    onChange={(e) => updateScheduleSession(day, 'location', e.target.value)}
                                    placeholder="e.g., Sports Hall, Level 1"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Hero Section
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                This appears at the top of your CCA page
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="/uploads/basketball-hero.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-2">Recommended size: 1200x400px</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="Brief description shown on hero section"
                  />
                </div>
              </div>
            </div>

            {/* Page Content Builder */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Page Content
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Build your CCA page by adding, removing, and reordering content blocks
              </p>

              <BlockEditor blocks={blocks} onBlocksChange={setBlocks} />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                  saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#F44336] text-white hover:bg-[#D32F2F]"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
