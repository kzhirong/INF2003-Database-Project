'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import SessionCard from '@/components/SessionCard';
import { getUserData } from '@/lib/auth';

export default function CCAAdminSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ccaId } = use(params);
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!userData) return;
    fetchSessions();
  }, [userData]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions?cca_id=${ccaId}`);
      const result = await response.json();

      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (sessionId: string) => {
    setDeleteId(sessionId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/sessions/${deleteId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Session deleted successfully' });
        fetchSessions();
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to delete session',
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setMessage({ type: 'error', text: 'Failed to delete session' });
    } finally {
      setDeleteId(null);
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

  // Filter sessions
  const now = new Date();
  const filteredSessions = sessions.filter((session) => {
    if (filter === 'upcoming') {
      return new Date(session.date) >= now;
    }
    if (filter === 'past') {
      return new Date(session.date) < now;
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
          <span className="text-gray-900 font-semibold">MANAGE SESSIONS</span>
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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Manage Sessions
            </h1>
            <p className="text-gray-600">
              Create and track attendance for practice sessions
            </p>
          </div>
          <button
            onClick={() => router.push(`/cca-admin/${ccaId}/sessions/create`)}
            className="px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer"
          >
            + Create Session
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#F44336] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-[#F44336] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors cursor-pointer ${
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
            <p className="text-gray-600 mt-4">Loading sessions...</p>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && filteredSessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div key={session.id} className="relative">
                <div
                  onClick={() =>
                    router.push(
                      `/cca-admin/${ccaId}/sessions/${session.id}/attendance`
                    )
                  }
                  className="cursor-pointer"
                >
                  <SessionCard {...session} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(session.id);
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors z-10 cursor-pointer"
                  title="Delete session"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Sessions */}
        {!loading && filteredSessions.length === 0 && (
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
              No sessions found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first session to get started
            </p>
            <button
              onClick={() => router.push(`/cca-admin/${ccaId}/sessions/create`)}
              className="px-6 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors cursor-pointer"
            >
              Create Session
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Session
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this session? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
