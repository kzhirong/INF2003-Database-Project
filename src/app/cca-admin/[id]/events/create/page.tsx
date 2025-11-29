'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import TimePicker from '@/components/TimePicker';
import { getUserData } from '@/lib/auth';

export default function CreateEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ccaId } = use(params);
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    max_attendees: '',
    registration_deadline: '',
    poster: null as File | null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getUserData();
      if (!data) {
        redirect('/');
      }
      if (data.role !== 'cca_admin') {
        redirect('/dashboard');
      }
      if (data.cca_id !== ccaId) {
        redirect(`/cca-admin/${data.cca_id}`);
      }
      setUserData(data);
    };
    checkAuth();
  }, [ccaId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, poster: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Validation Checks
    const now = new Date();
    // Create event date object combining date and start time
    const eventDateTime = new Date(`${formData.date}T${formData.start_time}`);
    
    // 1. Event date cannot be before current time
    if (eventDateTime < now) {
      setMessage({
        type: 'error',
        text: 'Event date and time cannot be in the past.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitting(false);
      return;
    }

    // 2. Registration deadline validation removed as requested

    try {
      // Upload poster if exists
      let poster_url = null;
      if (formData.poster) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.poster);

        const uploadResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload poster');
        }
        poster_url = uploadResult.url;
      }

      // Create event
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cca_id: ccaId,
          title: formData.title,
          description: formData.description,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
          max_attendees: formData.max_attendees
            ? parseInt(formData.max_attendees)
            : null,
          registration_deadline: formData.registration_deadline || null,
          poster_url,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Event created successfully!',
        });
        router.push(`/cca-admin/${ccaId}/events`);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create event',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!userData) {
    return null;
  }

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
          <span
            className="hover:text-[#F44336] cursor-pointer"
            onClick={() => router.push(`/cca-admin/${ccaId}/events`)}
          >
            EVENTS
          </span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">CREATE</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create a new event for your CCA
          </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Basic Information
              </h2>
              <div className="border-b-2 border-[#F44336] w-16 mb-6"></div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent resize-none"
                    placeholder="Describe your event..."
                  />
                </div>

                {/* Poster Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Poster
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: JPG, PNG, WEBP (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Date & Time
              </h2>
              <div className="border-b-2 border-[#F44336] w-16 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <TimePicker
                    value={formData.start_time}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, start_time: value }))
                    }
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <TimePicker
                    value={formData.end_time}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, end_time: value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Location and Capacity */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Location & Capacity
              </h2>
              <div className="border-b-2 border-[#F44336] w-16 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="e.g., Sports Hall, Auditorium"
                  />
                </div>

                {/* Max Attendees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Attendees
                  </label>
                  <input
                    type="number"
                    name="max_attendees"
                    value={formData.max_attendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty if there's no capacity limit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/cca-admin/${ccaId}/events`)}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
