'use client';

import { use, useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import NavbarClient from '@/components/NavbarClient';
import { getUserData } from '@/lib/auth';

interface Member {
  id: string;
  user_id: string;
  student: {
    id: string;
    name: string;
    student_id: string;
    email: string;
  };
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  student: {
    id: string;
    name: string;
    student_id: string;
    email: string;
  };
}

export default function SessionAttendancePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id: ccaId, sessionId } = use(params);
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

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
    fetchData();
  }, [userData, sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch session details
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();

      if (sessionResult.success) {
        setSession(sessionResult.data);
      }

      // Fetch attendance - this now contains ALL members (pre-created when session was created)
      const attendanceResponse = await fetch(
        `/api/sessions/${sessionId}/attendance`
      );
      const attendanceResult = await attendanceResponse.json();

      if (attendanceResult.success) {
        // Use attendance data as members - it has all the student details we need
        const membersFromAttendance = attendanceResult.data.map((record: any) => ({
          id: record.id,
          user_id: record.user_id,
          student: record.student,
        }));
        
        setMembers(membersFromAttendance);
        setAttendance(attendanceResult.data);
        setSummary(attendanceResult.summary);
        
        // Set selected users to those who have attended
        const attendedUserIds = new Set<string>(
          attendanceResult.data
            .filter((record: any) => record.attended)
            .map((record: AttendanceRecord) => record.user_id)
        );
        setSelectedUsers(attendedUserIds);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedUsers(new Set(members.map((m) => m.user_id)));
  };

  const deselectAll = () => {
    setSelectedUsers(new Set());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Refresh data
        fetchData();
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

  // Filter members by search
  const filteredMembers = members.filter((member) => {
    if (!member.student) return false; // Skip members without student data
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.student.name?.toLowerCase().includes(query) ||
      member.student.student_id?.toLowerCase().includes(query) ||
      member.student.email?.toLowerCase().includes(query)
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
            onClick={() => router.push(`/cca-admin/${ccaId}/sessions`)}
          >
            SESSIONS
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
            {session?.title || 'Session Attendance'}
          </h1>
          <p className="text-gray-600">
            {session?.date
              ? new Date(session.date).toLocaleDateString('en-SG', {
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
              <div className="text-sm text-gray-600 mb-1">Total Members</div>
              <div className="text-3xl font-bold text-gray-900">
                {summary.total_members}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Present</div>
              <div className="text-3xl font-bold text-green-600">
                {selectedUsers.size}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Absent</div>
              <div className="text-3xl font-bold text-red-600">
                {summary.total_members - selectedUsers.size}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Attendance Rate</div>
              <div className="text-3xl font-bold text-[#F44336]">
                {summary.total_members > 0
                  ? Math.round((selectedUsers.size / summary.total_members) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>
        )}

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-3 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-3 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === members.length && members.length > 0}
                    onChange={(e) =>
                      e.target.checked ? selectAll() : deselectAll()
                    }
                    className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                  />
                </th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleSelection(member.user_id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(member.user_id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#F44336] border-gray-300 rounded focus:ring-[#F44336]"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {member.student?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.student?.student_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.student?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUsers.has(member.user_id)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedUsers.has(member.user_id) ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No members found</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#F44336] text-white font-semibold rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
          <button
            onClick={() => router.push(`/cca-admin/${ccaId}/sessions`)}
            className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Back to Sessions
          </button>
        </div>
      </main>
    </div>
  );
}
