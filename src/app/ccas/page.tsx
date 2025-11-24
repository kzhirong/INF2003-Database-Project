"use client";

import NavbarClient from "@/components/NavbarClient";
import Link from "next/link";
import { useState, useEffect } from "react";

interface CCA {
  _id: string;
  name: string;
  category: string;
  schedule: string[];
  commitment: string;
  sportType?: string;
  shortDescription?: string;
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
    const matchesSchedule = selectedSchedule.length === 0 || selectedSchedule.some((day) => cca.schedule.includes(day));
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
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Explore CCAs</h1>
          <p className="text-xl text-gray-600">
            Find the perfect Co-Curricular Activity to enhance your university experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#F44336] hover:underline"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {["Sports", "Arts & Culture", "Academic", "Community Service", "Special Interest"].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                        className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                      />
                      <span className="ml-2 text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Schedule</h3>
                <div className="space-y-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSchedule.includes(day)}
                        onChange={() => toggleFilter(selectedSchedule, setSelectedSchedule, day)}
                        className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                      />
                      <span className="ml-2 text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commitment Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Commitment</h3>
                <div className="space-y-2">
                  {["Schedule Based", "Flexible", "Event Based"].map((commitment) => (
                    <label key={commitment} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCommitment.includes(commitment)}
                        onChange={() => toggleFilter(selectedCommitment, setSelectedCommitment, commitment)}
                        className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                      />
                      <span className="ml-2 text-gray-700">{commitment}</span>
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
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSportType.includes(type)}
                          onChange={() => toggleFilter(selectedSportType, setSelectedSportType, type)}
                          className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                        />
                        <span className="ml-2 text-gray-700">{type}</span>
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
                    className="bg-[#F44336] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {filter}
                    <button
                      onClick={() => {
                        if (selectedCategories.includes(filter)) setSelectedCategories(selectedCategories.filter((c) => c !== filter));
                        if (selectedSchedule.includes(filter)) setSelectedSchedule(selectedSchedule.filter((s) => s !== filter));
                        if (selectedCommitment.includes(filter)) setSelectedCommitment(selectedCommitment.filter((c) => c !== filter));
                        if (selectedSportType.includes(filter)) setSelectedSportType(selectedSportType.filter((s) => s !== filter));
                      }}
                      className="hover:bg-white hover:text-[#F44336] rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredCCAs.length}</span> {filteredCCAs.length === 1 ? 'CCA' : 'CCAs'}
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
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No CCAs found matching your filters</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-[#F44336] hover:underline"
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
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{cca.name}</h3>
                    <p className="text-gray-600 mb-4">
                      {cca.shortDescription || "Click to learn more about this CCA"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#F44336] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {cca.category}
                      </span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {cca.commitment}
                      </span>
                      {cca.sportType && (
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {cca.sportType}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
