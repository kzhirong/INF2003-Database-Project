'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Image from 'next/image';
import NavbarClient from '@/components/NavbarClient';
import { getUserData } from '@/lib/auth';
import type { EventWithDetails } from '@/types/event';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
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
    fetchEvent();
  }, [userData, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`);
      const result = await response.json();

      if (result.success) {
        setEvent(result.data);
      } else {
        setMessage({ type: 'error', text: 'Event not found' });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setMessage({ type: 'error', text: 'Failed to load event' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Successfully registered for event!',
        });
        // Refresh event data
        fetchEvent();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error registering:', error);
      setMessage({ type: 'error', text: 'Failed to register for event' });
    } finally {
      setRegistering(false);
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!userData || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD]">
        <NavbarClient />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F44336]"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAFBFD]">
        <NavbarClient />
        <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Event not found
            </h2>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F]"
            >
              Back to Events
            </button>
          </div>
        </main>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const registrationDeadline = event.registration_deadline
    ? new Date(event.registration_deadline)
    : null;
  const deadlinePassed =
    registrationDeadline && registrationDeadline < new Date();
  const eventPassed = eventDate < new Date();

  const canRegister =
    event.status === 'published' &&
    !event.is_registered &&
    !event.is_full &&
    !deadlinePassed &&
    !eventPassed;

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span
            className="hover:text-[#F44336] cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            HOME
          </span>
          <span className="mx-2">|</span>
          <span
            className="hover:text-[#F44336] cursor-pointer"
            onClick={() => router.push('/events')}
          >
            EVENTS
          </span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">{event.title}</span>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Poster */}
            {event.poster_url && (
              <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={event.poster_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Title and CCA */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-[#F44336] mb-2 uppercase">
                {event.cca_name}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* Status Badges */}
              <div className="flex gap-2">
                {event.status === 'cancelled' && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                    Cancelled
                  </span>
                )}
                {event.status === 'completed' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                    Completed
                  </span>
                )}
                {event.is_registered && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Registered
                  </span>
                )}
                {event.is_full && !event.is_registered && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                    Full
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About this Event
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Event Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Event Details
              </h2>

              <div className="space-y-4">
                {/* Date */}
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400 mt-0.5"
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
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-semibold text-gray-900">
                      {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-semibold text-gray-900">
                      {event.start_time} - {event.end_time}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-semibold text-gray-900">
                      {event.location}
                    </div>
                  </div>
                </div>

                {/* Registration Deadline */}
                {registrationDeadline && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-600">
                        Registration Deadline
                      </div>
                      <div
                        className={`font-semibold ${
                          deadlinePassed ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {registrationDeadline.toLocaleDateString('en-SG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {event.max_attendees && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">
                      Registration Status
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {event.current_registrations} / {event.max_attendees}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          event.is_full
                            ? 'bg-red-500'
                            : 'bg-[#F44336]'
                        }`}
                        style={{
                          width: `${
                            (event.current_registrations /
                              event.max_attendees) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Button */}
              <div className="mt-6">
                {canRegister ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                ) : event.is_registered ? (
                  <div className="w-full px-6 py-3 bg-green-50 text-green-800 font-semibold rounded-lg text-center border border-green-200">
                    You are registered
                  </div>
                ) : event.is_full ? (
                  <div className="w-full px-6 py-3 bg-orange-50 text-orange-800 font-semibold rounded-lg text-center border border-orange-200">
                    Event is full
                  </div>
                ) : deadlinePassed ? (
                  <div className="w-full px-6 py-3 bg-red-50 text-red-800 font-semibold rounded-lg text-center border border-red-200">
                    Registration closed
                  </div>
                ) : eventPassed ? (
                  <div className="w-full px-6 py-3 bg-gray-50 text-gray-800 font-semibold rounded-lg text-center border border-gray-200">
                    Event has passed
                  </div>
                ) : (
                  <div className="w-full px-6 py-3 bg-gray-50 text-gray-800 font-semibold rounded-lg text-center border border-gray-200">
                    Registration unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
