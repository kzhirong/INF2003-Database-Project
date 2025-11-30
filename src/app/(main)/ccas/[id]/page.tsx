"use client";

import BlockRenderer from "@/components/BlockRenderer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import { CCAPageData } from "@/types/blocks";
import { getUserData } from "@/lib/auth";

export default function CCADetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        setError(data.error || "Failed to load CCA");
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
      if (
        userData?.role === "cca_admin" &&
        userData?.cca_id === resolvedParams.id
      ) {
        setCanEdit(true);
      }
    } catch (err) {
      console.error("Error checking edit permission:", err);
    }
  };

  const fetchMemberCount = async () => {
    try {
      const response = await fetch(
        `/api/ccas/${resolvedParams.id}/member-count`
      );
      const data = await response.json();

      if (data.success) {
        setMemberCount(data.count);
      }
    } catch (err) {
      console.error("Error fetching member count:", err);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading CCA...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !ccaData) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              CCA Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The CCA you are looking for does not exist."}
            </p>
            <Link
              href="/ccas"
              className="text-[#F44336] hover:underline font-semibold"
            >
              ← Back to CCAs
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#F44336] transition-colors">
            HOME
          </Link>
          <span className="mx-2">|</span>
          <Link href="/ccas" className="hover:text-[#F44336] transition-colors">
            EXPLORE CCAS
          </Link>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold uppercase">
            {ccaData.name}
          </span>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8">
          {/* Hero Image Background - 3:1 aspect ratio */}
          <div
            className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900"
            style={{ aspectRatio: "3/1" }}
          >
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
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60" />
          </div>

          {/* Content Section with Profile Image */}
          <div className="relative px-8 md:px-12">
            {/* Profile Image - Overlapping */}
            <div className="absolute -top-16 left-8 md:left-12">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden relative">
                {ccaData.profileImage ? (
                  <Image
                    src={ccaData.profileImage}
                    alt={ccaData.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F44336] flex items-center justify-center text-white font-bold text-5xl">
                    {ccaData.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Title & Info Section */}
            <div className="pt-20 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-[#F44336] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {ccaData.category}
                  </span>
                  {ccaData.sportType && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                      {ccaData.sportType}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                  {ccaData.name}
                </h1>
                {ccaData.shortDescription && (
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    {ccaData.shortDescription}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              {canEdit && (
                <Link
                  href={`/ccas/${resolvedParams.id}/edit`}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Page
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Dynamic Blocks */}
            {ccaData.blocks && ccaData.blocks.length > 0 ? (
              <BlockRenderer blocks={ccaData.blocks} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  More content coming soon
                </h3>
                <p className="text-gray-500">
                  The CCA admins are working on adding more exciting details!
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Key Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Members</span>
                  <span className="font-bold text-gray-900">{memberCount}</span>
                </div>

                {ccaData.schedule && ccaData.schedule.length > 0 && (
                  <div className="pt-2">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Schedule
                    </div>
                    <div className="space-y-2">
                      {ccaData.schedule.map((session, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-2 border border-gray-100"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {session.day}
                            </span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {session.location}
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
      </main>
    </>
  );
}
