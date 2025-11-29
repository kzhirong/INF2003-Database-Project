'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import { getUserData } from '@/lib/auth';

interface AttendanceRecord {
  id: string;
  user_id: string;
  attended: boolean;
  marked_at: string | null;
  student: {
    id: string;
    name: string;
    student_id: string;
    email: string;
  };
}

export default function EventAttendancePage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id: ccaId, eventId } = use(params);
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchEventAndAttendance();
  }, [userData, eventId]);

  const fetchEventAndAttendance = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventResult = await eventResponse.json();

      if (eventResult.success) {
        setEvent(eventResult.data);
      }

      // Fetch attendance
      const attendanceResponse = await fetch(
        `/api/events/${eventId}/attendance`
      );
      const attendanceResult = await attendanceResponse.json();

      if (attendanceResult.success) {
        setAttendance(attendanceResult.data);
        setSummary(attendanceResult.summary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (userId: string) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.user_id === userId
          ? { ...record, attended: !record.attended }
          : record
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: attendance.map((record) => ({
            user_id: record.user_id,
            attended: record.attended,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        // Refresh data
        fetchEventAndAttendance();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage({ type: 'error', text: 'Failed to save attendance' });
    } finally {
      setSaving(false);
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

  // Filter attendance by search
  const filteredAttendance = attendance.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.student.name.toLowerCase().includes(query) ||
      record.student.student_id.toLowerCase().includes(query) ||
      record.student.email.toLowerCase().includes(query)
    );
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
          <span
            className="hover:text-[#F44336] cursor-pointer"
            onClick={() => router.push(`/cca-admin/${ccaId}/events`)}
          >
            EVENTS
          </span>
          <span className="mx-2">|</span>
          <span className="text-gray-900 font-semibold">ATTENDANCE</span>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {event?.title || 'Event Attendance'}
          </h1>
          <p className="text-gray-600">
            {event?.date
              ? new Date(event.date).toLocaleDateString('en-SG', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Registered</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.total_registered}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Attended</div>
              <div className="text-3xl font-bold text-green-600">
                {summary.attended}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Absent</div>
              <div className="text-3xl font-bold text-red-600">
                {summary.absent}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Attendance Rate</div>
              <div className="text-3xl font-bold text-[#F44336]">
                {summary.attendance_rate}%
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          />
        </div>

        {/* Attendance Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Student ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.student.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.student.student_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.student.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.attended
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.attended ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAttendance(record.user_id)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        record.attended
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      Mark as {record.attended ? 'Absent' : 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAttendance.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No registrations found</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
          <button
            onClick={() => router.push(`/cca-admin/${ccaId}/events`)}
            className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </main>
    </div>
  );
}
