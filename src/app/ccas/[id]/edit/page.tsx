"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import BlockEditor from "@/components/BlockEditor";
import { Block } from "@/types/blocks";

export default function EditCCAPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fixed/Required fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sports");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [commitment, setCommitment] = useState("Schedule Based");
  const [sportType, setSportType] = useState("Competitive");

  // Hero section
  const [heroImage, setHeroImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Meeting details (sidebar)
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [currentMembers, setCurrentMembers] = useState(0);
  const [maxMembers, setMaxMembers] = useState(0);

  // Dynamic content blocks
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch existing CCA data on mount
  useEffect(() => {
    fetchCCAData();
  }, [resolvedParams.id]);

  const fetchCCAData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ccas/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const cca = data.data;
        setName(cca.name || "");
        setCategory(cca.category || "Sports");
        setSchedule(cca.schedule || []);
        setCommitment(cca.commitment || "Schedule Based");
        setSportType(cca.sportType || "Competitive");
        setHeroImage(cca.heroImage || "");
        setShortDescription(cca.shortDescription || "");
        setMeetingTime(cca.meetingDetails?.time || "");
        setMeetingLocation(cca.meetingDetails?.location || "");
        setContactEmail(cca.meetingDetails?.contactEmail || "");
        setCurrentMembers(cca.stats?.currentMembers || 0);
        setMaxMembers(cca.stats?.maxMembers || 0);
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
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const ccaData = {
        _id: resolvedParams.id,
        name,
        category,
        schedule,
        commitment,
        sportType,
        heroImage,
        shortDescription,
        meetingDetails: {
          time: meetingTime,
          location: meetingLocation,
          contactEmail: contactEmail
        },
        stats: {
          currentMembers,
          maxMembers
        },
        blocks
      };

      const response = await fetch(`/api/ccas/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ccaData)
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Changes saved successfully!");
        router.push(`/ccas/${resolvedParams.id}`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving CCA:", error);
      alert("❌ Failed to save changes");
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
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit CCA Page</h1>
          <p className="text-gray-600">Customize your CCA page with flexible content blocks</p>
        </div>

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
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule */}
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

              {/* Commitment Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Commitment Type *
                </label>
                <select
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                >
                  {commitmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sport Type (conditional) */}
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

          {/* Meeting Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
              Meeting Details
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This information appears in the sidebar
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Time
                </label>
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="e.g., Monday & Wednesday, 6:00 PM - 8:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Location
                </label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="e.g., Sports Hall, Level 1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="e.g., basketball@sit.edu.sg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Members
                  </label>
                  <input
                    type="number"
                    value={currentMembers}
                    onChange={(e) => setCurrentMembers(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Members
                  </label>
                  <input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>
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
    </div>
  );
}
