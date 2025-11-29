'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import TimePicker from '@/components/TimePicker';
import { getUserData } from '@/lib/auth';

export default function CreateSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ccaId } = use(params);
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    notes: '',
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    // Validation Checks
    const now = new Date();
    const sessionDateTime = new Date(`${formData.date}T${formData.start_time}`);
    
    if (sessionDateTime < now) {
      setMessage({
        type: 'error',
        text: 'Session date and time cannot be in the past.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCreating(false);
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cca_id: ccaId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Session created successfully!' });
        router.push(`/cca-admin/${ccaId}/sessions`);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setMessage({ type: 'error', text: 'Failed to create session' });
    } finally {
      setCreating(false);
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
            onClick={() => router.push(`/cca-admin/${ccaId}/sessions`)}
          >
            SESSIONS
          </span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">CREATE</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Session
          </h1>
          <p className="text-gray-600">
            Schedule a new practice session or meeting
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
        <form onSubmit={handleCreate}>
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="e.g., Weekly Practice"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <TimePicker
                    value={formData.start_time}
                    onChange={(value) =>
                      setFormData({ ...formData, start_time: value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <TimePicker
                    value={formData.end_time}
                    onChange={(value) =>
                      setFormData({ ...formData, end_time: value })
                    }
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  placeholder="e.g., Sports Hall"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {creating ? 'Creating...' : 'Create Session'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/cca-admin/${ccaId}/sessions`)}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
