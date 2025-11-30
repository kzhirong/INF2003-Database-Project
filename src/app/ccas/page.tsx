"use client";

import NavbarClient from "@/components/NavbarClient";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ScheduleSession {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface CCA {
  _id: string;
  name: string;
  category: string;
  schedule?: ScheduleSession[];
  commitment: string;
  sportType?: string;
  shortDescription?: string;
  heroImage?: string;
  profileImage?: string;
}

export default function CCAs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string[]>([]);
  const [selectedCommitment, setSelectedCommitment] = useState<string[]>([]);
  const [selectedSportType, setSelectedSportType] = useState<string[]>([]);

  const [ccaItems, setCCAItems] = useState<CCA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCCAs();
  }, []);

  const fetchCCAs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ccas');
      const data = await response.json();

      if (data.success) {
        setCCAItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching CCAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterArray: string[], setFilterArray: Function, value: string) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter((item) => item !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSchedule([]);
    setSelectedCommitment([]);
    setSelectedSportType([]);
  };

  const filteredCCAs = ccaItems.filter((cca) => {
    const matchesSearch = cca.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(cca.category);
    const matchesSchedule = selectedSchedule.length === 0 || selectedSchedule.some((day) =>
      cca.schedule?.some(session => session.day === day)
    );
    const matchesCommitment = selectedCommitment.length === 0 || selectedCommitment.includes(cca.commitment);
    const matchesSportType = selectedSportType.length === 0 || (cca.sportType && selectedSportType.includes(cca.sportType));

    return matchesSearch && matchesCategory && matchesSchedule && matchesCommitment && matchesSportType;
  });

  const activeFilters = [
    ...selectedCategories,
    ...selectedSchedule,
    ...selectedCommitment,
    ...selectedSportType,
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#F44336] transition-colors">HOME</Link>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">EXPLORE CCAS</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore CCAs</h1>
          <p className="text-gray-600">
            Find the perfect Co-Curricular Activity to enhance your university experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#F44336] hover:underline font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search CCAs..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {["Sports", "Arts & Culture", "Academic", "Community Service", "Special Interest"].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#F44336] checked:bg-[#F44336] hover:border-[#F44336]"
                        />
                        <svg
                          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Schedule</h3>
                <div className="space-y-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSchedule.includes(day)}
                          onChange={() => toggleFilter(selectedSchedule, setSelectedSchedule, day)}
                          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#F44336] checked:bg-[#F44336] hover:border-[#F44336]"
                        />
                        <svg
                          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commitment Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Commitment</h3>
                <div className="space-y-2">
                  {["Schedule Based", "Event Based"].map((commitment) => (
                    <label key={commitment} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCommitment.includes(commitment)}
                          onChange={() => toggleFilter(selectedCommitment, setSelectedCommitment, commitment)}
                          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#F44336] checked:bg-[#F44336] hover:border-[#F44336]"
                        />
                        <svg
                          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{commitment}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sport Type Filter (only for Sports category) */}
              {selectedCategories.includes("Sports") && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Sport Type</h3>
                  <div className="space-y-2">
                    {["Competitive", "Recreational", "Both"].map((type) => (
                      <label key={type} className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSportType.includes(type)}
                            onChange={() => toggleFilter(selectedSportType, setSelectedSportType, type)}
                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-[#F44336] checked:bg-[#F44336] hover:border-[#F44336]"
                          />
                          <svg
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CCA Grid */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="bg-[#F44336] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
                  >
                    {filter}
                    <button
                      onClick={() => {
                        if (selectedCategories.includes(filter)) setSelectedCategories(selectedCategories.filter((c) => c !== filter));
                        if (selectedSchedule.includes(filter)) setSelectedSchedule(selectedSchedule.filter((s) => s !== filter));
                        if (selectedCommitment.includes(filter)) setSelectedCommitment(selectedCommitment.filter((c) => c !== filter));
                        if (selectedSportType.includes(filter)) setSelectedSportType(selectedSportType.filter((s) => s !== filter));
                      }}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-bold text-gray-900">{filteredCCAs.length}</span> {filteredCCAs.length === 1 ? 'CCA' : 'CCAs'}
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading CCAs...</p>
                </div>
              </div>
            ) : filteredCCAs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No CCAs found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-[#F44336] hover:text-[#D32F2F] font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCCAs.map((cca) => (
                  <Link
                    key={cca._id}
                    href={`/ccas/${cca._id}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
                  >
                    {/* Hero Image Section */}
                    <div className="h-48 w-full relative bg-gray-100 overflow-hidden">
                      {cca.heroImage ? (
                        <Image
                          src={cca.heroImage}
                          alt={cca.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60"></div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 pb-6 flex-grow flex flex-col relative">
                      {/* Profile Image - Overlapping */}
                      <div className="absolute -top-10 left-6">
                        <div className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative">
                          {cca.profileImage ? (
                            <Image
                              src={cca.profileImage}
                              alt={cca.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#F44336] flex items-center justify-center text-white font-bold text-2xl">
                              {cca.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-12">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#F44336] transition-colors">
                              {cca.name}
                            </h3>
                            <p className="text-sm text-[#F44336] font-semibold tracking-wide uppercase text-xs mt-1">
                              {cca.category}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                          {cca.shortDescription || "Join us to find out more about this exciting CCA!"}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {cca.commitment}
                          </span>
                          {cca.sportType && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                              {cca.sportType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
