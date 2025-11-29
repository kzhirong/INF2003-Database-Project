"use client";

import NavbarClient from "@/components/NavbarClient";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { CCAPageData } from "@/types/blocks";
import { getUserData } from "@/lib/auth";

export default function CCADetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [ccaData, setCCAData] = useState<CCAPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    fetchCCAData();
    checkEditPermission();
    fetchMemberCount();
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

  const fetchMemberCount = async () => {
    try {
      const response = await fetch(`/api/ccas/${resolvedParams.id}/member-count`);
      const data = await response.json();

      if (data.success) {
        setMemberCount(data.count);
      }
    } catch (err) {
      console.error('Error fetching member count:', err);
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
              {/* Member Count */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F44336] mb-1">
                    {memberCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {memberCount === 1 ? 'Active Member' : 'Active Members'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Contact CCA admin to join
                  </div>
                </div>
              </div>

              {/* Schedule */}
              {ccaData.schedule && ccaData.schedule.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule</h3>
                  <div className="space-y-3">
                    {ccaData.schedule.map((session, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold text-gray-900 mb-2">{session.day}</div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>
                            <span className="text-gray-500">Time:</span> {session.startTime} - {session.endTime}
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span> {session.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
