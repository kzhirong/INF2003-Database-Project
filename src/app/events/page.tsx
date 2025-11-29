'use client';

import { use, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import EventCard from '@/components/EventCard';
import { getUserData } from '@/lib/auth';
import type { EventWithDetails } from '@/types/event';

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'registered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const data = await getUserData();
      if (!data) {
        redirect('/');
      }
      setUserData(data);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!userData) return;
    fetchEvents();
  }, [userData]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const result = await response.json();

      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  // Filter events
  const filteredEvents = events.filter((event) => {
    // Filter by status
    if (filter === 'upcoming' && event.status !== 'published') {
      return false;
    }
    if (filter === 'registered' && !event.is_registered) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.cca_name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.date) >= now && event.status === 'published'
  );
  const pastEvents = filteredEvents.filter(
    (event) =>
      new Date(event.date) < now ||
      event.status === 'completed' ||
      event.status === 'cancelled'
  );

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span className="hover:text-[#F44336] cursor-pointer">HOME</span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">EVENTS</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CCA Events
          </h1>
          <p className="text-gray-600">
            Discover and register for exciting events across all CCAs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events by title, CCA, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-[#F44336] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-[#F44336] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('registered')}
                className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                  filter === 'registered'
                    ? 'bg-[#F44336] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Registrations
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F44336] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        )}

        {/* Events List */}
        {!loading && (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Upcoming Events
                </h2>
                <div className="flex flex-col gap-8">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} {...event} variant="horizontal" />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Past Events
                </h2>
                <div className="flex flex-col gap-8">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} {...event} variant="horizontal" />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {upcomingEvents.length === 0 && pastEvents.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-600">
                  {filter === 'registered'
                    ? "You haven't registered for any events yet."
                    : searchQuery
                    ? 'Try adjusting your search criteria.'
                    : 'Check back later for new events!'}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
