'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/auth';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ccaId } = use(params);
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getUserData();
      if (!data || data.role !== 'cca_admin' || data.cca_id !== ccaId) {
        router.push('/');
        return;
      }
      setUserData(data);
    };
    checkAuth();
  }, [ccaId, router]);

  useEffect(() => {
    if (userData) {
      fetchAnalytics();
    }
  }, [userData]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/cca-admin/${ccaId}/analytics`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F44336]"></div>
      </div>
    );
  }

  return (
    <>
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
          <span className="text-gray-900 font-semibold">ANALYTICS</span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analytics & Insights
          </h1>
          <p className="text-gray-600">
            Track your CCA's performance and attendance trends
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">
              Total Members
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {stats?.memberCount || 0}
              </span>
              <span className="text-gray-400 mb-1">students</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">
              Avg. Attendance
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[#F44336]">
                {stats?.averageAttendance || 0}%
              </span>
              <span className="text-gray-400 mb-1">rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">
              Total Sessions
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {stats?.sessionCount || 0}
              </span>
              <span className="text-gray-400 mb-1">sessions</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase mb-2">
              Total Events
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {stats?.eventCount || 0}
              </span>
              <span className="text-gray-400 mb-1">events</span>
            </div>
          </div>
        </div>

        {/* Attendance Trend Chart */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Attendance Trends
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#F44336] rounded-full"></div>
                <span className="text-sm text-gray-600">Attendance Rate</span>
              </div>
            </div>
          </div>
          
          {stats?.trendData && stats.trendData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F44336" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F44336" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-SG', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
                            <p className="text-sm font-bold text-gray-900 mb-1">
                              {new Date(label as string).toLocaleDateString('en-SG', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                data.type === 'Event' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {data.type}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {data.title}
                            </p>
                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-bold text-[#F44336]">
                                {payload[0].value}%
                              </span>
                              <span className="text-xs text-gray-500 mb-1">
                                ({data.present}/{data.total} present)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#F44336"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No attendance data available yet
            </div>
          )}
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.trendData?.slice().reverse().slice(0, 5).map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString('en-SG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'Event' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.present} / {item.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {item.rate}%
                    </td>
                  </tr>
                ))}
                {(!stats?.trendData || stats.trendData.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No recent activity found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
