"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import { getUserData } from "@/lib/auth";

export default function AdminEditCCAPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form fields (Required Information)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sports");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("Schedule Based");
  const [sportType, setSportType] = useState("Competitive");

  // Form fields (Account Information)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Constants
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const categories = ["Sports", "Arts & Culture", "Academic", "Community Service", "Special Interest"];
  const commitmentTypes = ["Schedule Based", "Flexible", "Event Based"];
  const sportTypes = ["Competitive", "Recreational", "Both"];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await getUserData();
      if (!userData || userData.role !== "system_admin") {
        router.push("/");
        return;
      }
      setIsAdmin(true);
      fetchData();
    } catch (err) {
      router.push("/");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch CCA Data
      const ccaResponse = await fetch(`/api/ccas/${resolvedParams.id}`);
      const ccaData = await ccaResponse.json();

      if (ccaData.success) {
        const cca = ccaData.data;
        setName(cca.name || "");
        setCategory(cca.category || "Sports");
        setSchedule(cca.schedule || []);
        setCommitment(cca.commitment || "Schedule Based");
        setSportType(cca.sportType || "Competitive");
      } else {
        alert("Failed to load CCA data");
        router.push("/admin");
        return;
      }

      // Fetch User Data (Email)
      const userResponse = await fetch(`/api/admin/cca-user/${resolvedParams.id}`);
      const userData = await userResponse.json();
      
      if (userData.success) {
        setEmail(userData.email || "");
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = (day: string) => {
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. Update CCA Details
      const ccaData: any = {
        _id: resolvedParams.id,
        name,
        category,
        commitment,
      };

      if (commitment === "Schedule Based") {
        ccaData.schedule = schedule;
      } else {
        ccaData.schedule = null;
      }

      if (category === "Sports") {
        ccaData.sportType = sportType;
      } else {
        ccaData.sportType = null;
      }

      const ccaUpdateResponse = await fetch(`/api/ccas/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ccaData)
      });

      const ccaUpdateResult = await ccaUpdateResponse.json();

      if (!ccaUpdateResult.success) {
        throw new Error(ccaUpdateResult.error || "Failed to update CCA details");
      }

      // 2. Update User Credentials (if changed)
      if (email || password) {
        const userUpdateResponse = await fetch(`/api/admin/cca-user/${resolvedParams.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const userUpdateResult = await userUpdateResponse.json();
        if (!userUpdateResult.success) {
          throw new Error(userUpdateResult.error || "Failed to update user credentials");
        }
      }

      alert("✅ Changes saved successfully!");
      router.push("/admin");

    } catch (error: any) {
      console.error("Error saving changes:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit CCA Details</h1>
            <p className="text-gray-600 mt-1">Update information for {name}</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Required Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
              Required Information
            </h3>
            <p className="text-sm text-gray-500">
              These fields are required for filtering and categorization
            </p>

            <div className="space-y-4">
              {/* CCA Name */}
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

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setCategory(newCategory);
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

              {/* Sport Type */}
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

              {/* Schedule */}
              {commitment === "Schedule Based" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleScheduleToggle(day)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          schedule.includes(day)
                            ? "bg-[#F44336] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
              Account Information
            </h3>
            <p className="text-sm text-gray-500">
              Update the CCA Admin's login credentials
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#F44336] hover:bg-[#D32F2F]"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
