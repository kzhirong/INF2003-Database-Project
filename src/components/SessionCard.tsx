import Link from 'next/link';

interface SessionCardProps {
  id: string;
  title: string;
  cca_name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  attendance_count: number;
  total_members: number;
  clickable?: boolean;
  onClick?: () => void;
}

export default function SessionCard({
  id,
  title,
  cca_name,
  date,
  start_time,
  end_time,
  location,
  attendance_count,
  total_members,
  clickable = false,
  onClick,
}: SessionCardProps) {
  // Format date
  const sessionDate = new Date(date);
  const formattedDate = sessionDate.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const dayOfWeek = sessionDate.toLocaleDateString('en-SG', {
    weekday: 'short',
  });

  // Calculate attendance rate
  const attendanceRate =
    total_members > 0
      ? Math.round((attendance_count / total_members) * 100)
      : 0;

  const content = (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
        clickable ? 'hover:shadow-md cursor-pointer' : ''
      } transition-shadow duration-200`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* CCA Name */}
          <div className="text-xs font-semibold text-[#F44336] mb-1 uppercase">
            {cca_name}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        </div>

        {/* Attendance Badge */}
        {/* Attendance Badge - Removed */}
      </div>

      {/* Date and Time */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2 text-gray-400"
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
          <span className="font-medium">
            {dayOfWeek}, {formattedDate}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2 text-gray-400"
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
          <span>
            {start_time} - {end_time}
          </span>
        </div>

        {location && (
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Attendance Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {attendance_count}
          </span>{' '}
          / {total_members} attended
        </div>
        <div className="text-xs text-gray-500">
          {total_members - attendance_count} absent
        </div>
      </div>
    </div>
  );

  if (clickable && !onClick) {
    return <Link href={`/cca-admin/sessions/${id}`}>{content}</Link>;
  }

  return content;
}
