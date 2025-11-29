"use client";

import NavbarClient from "@/components/NavbarClient";
import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";
import Image from "next/image";
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
      <div className="min-h-screen bg-[#FAFBFD]">
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
      <div className="min-h-screen bg-[#FAFBFD]">
        <NavbarClient />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">CCA Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The CCA you are looking for does not exist.'}</p>
            <Link href="/ccas" className="text-[#F44336] hover:underline font-semibold">
              ← Back to CCAs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-gray-900 mt-6 rounded-3xl overflow-hidden mx-auto max-w-[95%] shadow-2xl">
        {ccaData.heroImage ? (
          <Image
            src={ccaData.heroImage}
            alt={ccaData.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
        )}
        {/* Gradient Overlay - Only at the bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-8">
            {/* Profile Image */}
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white bg-white shadow-2xl overflow-hidden flex-shrink-0 -mb-16 md:-mb-20 z-10">
              {ccaData.profileImage ? (
                <Image
                  src={ccaData.profileImage}
                  alt={ccaData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F44336] flex items-center justify-center text-white font-bold text-4xl">
                  {ccaData.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Title & Badges */}
            <div className="flex-grow mb-2 md:mb-0 z-10">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#F44336] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {ccaData.category}
                </span>
                {ccaData.sportType && (
                  <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/30 shadow-sm">
                    {ccaData.sportType}
                  </span>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{ccaData.name}</h1>
            </div>

            {/* Edit Button */}
            {canEdit && (
              <Link
                href={`/ccas/${resolvedParams.id}/edit`}
                className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg flex items-center gap-2 mb-4 md:mb-0 transform hover:scale-105"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Page
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Us</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {ccaData.shortDescription || "No description available for this CCA yet."}
              </p>
            </div>

            {/* Dynamic Blocks */}
            {ccaData.blocks && ccaData.blocks.length > 0 ? (
              <div className="space-y-8">
                <BlockRenderer blocks={ccaData.blocks} />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">More content coming soon</h3>
                <p className="text-gray-500">The CCA admins are working on adding more exciting details!</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F44336]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Commitment</span>
                  <span className="font-semibold text-gray-900">{ccaData.commitment}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold text-gray-900">{memberCount} Active</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-600">Established</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(ccaData.createdAt).getFullYear()}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 bg-[#F44336] hover:bg-[#D32F2F] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                Join {ccaData.name}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            {/* Schedule Card */}
            {ccaData.schedule && ccaData.schedule.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#F44336]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Weekly Schedule
                </h3>
                <div className="space-y-3">
                  {ccaData.schedule.map((session, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-[#F44336]/30 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{session.day}</span>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {session.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Have questions?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Reach out to our committee members for more information about upcoming events and trials.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-white/20">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
