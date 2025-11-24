"use client";

import NavbarClient from "@/components/NavbarClient";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { CCAPageData } from "@/types/blocks";
import { getUserData } from "@/lib/auth";

export default function CCADetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [ccaData, setCCAData] = useState<CCAPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    fetchCCAData();
    checkEditPermission();
  }, [resolvedParams.id]);

  const fetchCCAData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ccas/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setCCAData(data.data);
      } else {
        setError(data.error || 'Failed to load CCA');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEditPermission = async () => {
    try {
      const userData = await getUserData();
      // User can edit if they are CCA admin of THIS specific CCA
      if (userData?.role === 'cca_admin' && userData?.cca_id === resolvedParams.id) {
        setCanEdit(true);
      }
    } catch (err) {
      console.error('Error checking edit permission:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarClient />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CCA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ccaData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarClient />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">CCA Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The CCA you are looking for does not exist.'}</p>
            <Link href="/ccas" className="text-[#F44336] hover:underline">
              ← Back to CCAs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    setIsEnrolled(!isEnrolled);
    // TODO: API call to enroll/unenroll
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/landing" className="hover:text-[#F44336]">
              Home
            </Link>
            <span>/</span>
            <Link href="/ccas" className="hover:text-[#F44336]">
              CCAs
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ccaData.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">{ccaData.name}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#F44336] text-white px-4 py-2 rounded-full font-semibold">
                  {ccaData.category}
                </span>
                <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold">
                  {ccaData.commitment}
                </span>
                {ccaData.sportType && (
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold">
                    {ccaData.sportType}
                  </span>
                )}
              </div>
            </div>
            {canEdit && (
              <Link
                href={`/ccas/${resolvedParams.id}/edit`}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                ✏️ Edit Page
              </Link>
            )}
          </div>

          {ccaData.heroImage && (
            <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-6">
              <img
                src={ccaData.heroImage}
                alt={ccaData.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {ccaData.shortDescription && (
            <p className="text-xl text-gray-700">{ccaData.shortDescription}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Blocks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {ccaData.blocks && ccaData.blocks.length > 0 ? (
                <BlockRenderer blocks={ccaData.blocks} />
              ) : (
                <p className="text-gray-500 text-center py-12">
                  No content blocks added yet. Click "Edit Page" to add content.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Enrollment Status */}
              <div className="mb-6">
                <button
                  onClick={handleEnroll}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                    isEnrolled
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-[#F44336] text-white hover:bg-[#D32F2F]"
                  }`}
                >
                  {isEnrolled ? "✓ Enrolled" : "Join CCA"}
                </button>
              </div>

              {/* Meeting Details */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Meeting Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Time</div>
                    <div className="text-gray-900">{ccaData.meetingDetails.time}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Location</div>
                    <div className="text-gray-900">{ccaData.meetingDetails.location}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Schedule</div>
                    <div className="flex flex-wrap gap-2">
                      {ccaData.schedule.map((day) => (
                        <span
                          key={day}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
                <a
                  href={`mailto:${ccaData.meetingDetails.contactEmail}`}
                  className="text-[#F44336] hover:underline text-sm"
                >
                  {ccaData.meetingDetails.contactEmail}
                </a>
              </div>

              {/* Members */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Members</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#F44336] h-full"
                        style={{
                          width: `${(ccaData.stats.currentMembers / ccaData.stats.maxMembers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {ccaData.stats.currentMembers}/{ccaData.stats.maxMembers}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
