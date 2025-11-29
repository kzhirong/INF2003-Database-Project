'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import { getUserData } from '@/lib/auth';
import type { EventWithDetails } from '@/types/event';
import Image from 'next/image';

export default function CCAAdminEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ccaId } = use(params);
  const router = useRouter();

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getUserData();
      if (!data) {
        redirect('/');
      }
      if (data.role !== 'cca_admin') {
        redirect('/dashboard');
      }
      // Check if admin owns this CCA
      if (data.cca_id !== ccaId) {
        redirect(`/cca-admin/${data.cca_id}`);
      }
      setUserData(data);
    };
    checkAuth();
  }, [ccaId]);

  useEffect(() => {
    if (!userData) return;
    fetchEvents();
  }, [userData]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?cca_id=${ccaId}`);
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

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        // Refresh events list
        fetchEvents();
      } else {
        alert(result.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (!userData) {
    return null;
  }

  // Filter events
  const now = new Date();
  const filteredEvents = events.filter((event) => {
    if (filter === 'upcoming') {
      return new Date(event.date) >= now && event.status === 'published';
    }
    if (filter === 'past') {
      return (
        new Date(event.date) < now ||
        event.status === 'completed' ||
        event.status === 'cancelled'
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span
            className="hover:text-[#F44336] cursor-pointer"
            onClick={() => router.push(`/cca-admin/${ccaId}`)}
          >
            DASHBOARD
          </span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">MANAGE EVENTS</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Manage Events
            </h1>
            <p className="text-gray-600">
              Create and manage events for your CCA
            </p>
          </div>
          <button
            onClick={() => router.push(`/cca-admin/${ccaId}/events/create`)}
            className="px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors"
          >
            + Create Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
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
            onClick={() => setFilter('past')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              filter === 'past'
                ? 'bg-[#F44336] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F44336] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        )}

        {/* Events List */}
        {!loading && filteredEvents.length > 0 && (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Poster Thumbnail */}
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {event.poster_url ? (
                      <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F44336] to-[#D32F2F]">
                        <svg
                          className="w-8 h-8 text-white opacity-50"
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
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        <div className="flex gap-2 mb-2">
                          {event.status === 'cancelled' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              Cancelled
                            </span>
                          )}
                          {event.status === 'completed' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                              Completed
                            </span>
                          )}
                          {event.is_full && event.status === 'published' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                              Full
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Date:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-SG')}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Time:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {event.start_time} - {event.end_time}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Location:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {event.location}
                        </span>
                      </div>
                      {event.max_attendees && (
                        <div className="text-sm">
                          <span className="text-gray-600">Registered:</span>{' '}
                          <span className="font-semibold text-gray-900">
                            {event.current_registrations} / {event.max_attendees}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/cca-admin/${ccaId}/events/${event.id}/attendance`
                          )
                        }
                        className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        View Attendance
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/cca-admin/${ccaId}/events/${event.id}/edit`)
                        }
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Events */}
        {!loading && filteredEvents.length === 0 && (
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
            <p className="text-gray-600 mb-6">
              Create your first event to get started
            </p>
            <button
              onClick={() => router.push(`/cca-admin/${ccaId}/events/create`)}
              className="px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors"
            >
              Create Event
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
