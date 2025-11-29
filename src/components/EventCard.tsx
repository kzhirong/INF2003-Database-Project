import Link from 'next/link';
import Image from 'next/image';

interface EventCardProps {
  id: string;
  title: string;
  cca_name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  poster_url: string | null;
  max_attendees: number | null;
  current_registrations: number;
  spots_remaining: number | null;
  is_full: boolean;
  is_registered?: boolean;
  status: 'published' | 'cancelled' | 'completed';
  variant?: 'horizontal' | 'vertical'; // horizontal for events page, vertical for dashboard
  href?: string; // Optional override for link destination
}

export default function EventCard({
  id,
  title,
  cca_name,
  date,
  start_time,
  end_time,
  location,
  poster_url,
  max_attendees,
  current_registrations,
  spots_remaining,
  is_full,
  is_registered,
  status,
  variant = 'vertical', // Default to vertical for backward compatibility
  href,
}: EventCardProps) {
  // Format date
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const dayOfWeek = eventDate.toLocaleDateString('en-SG', { weekday: 'short' });

  // Determine link destination
  const linkHref = href || `/events/${id}`;

  // Horizontal layout for events page
  if (variant === 'horizontal') {
    return (
      <Link href={linkHref} className="block">
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow cursor-pointer">
          {/* Image Section */}
          <div className="w-full sm:w-[358px] h-[276px] bg-gray-100 flex items-center justify-center flex-shrink-0 relative">
            {poster_url ? (
              <Image
                src={poster_url}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F44336] to-[#D32F2F]">
                <svg
                  className="w-16 h-16 text-white opacity-50"
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
            {/* Status Badges */}
            {status === 'cancelled' && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Cancelled
              </div>
            )}
            {status === 'completed' && (
              <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Completed
              </div>
            )}
            {is_registered && status === 'published' && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Registered
              </div>
            )}
            {is_full && !is_registered && status === 'published' && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Full
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-10 flex flex-col justify-center flex-grow">
            {/* CCA Name */}
            <p className="text-[#F44336] text-sm md:text-base font-semibold mb-3 uppercase tracking-wide">
              {cca_name}
            </p>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-3 leading-tight">
              {title}
            </h3>

            {/* Date and Time */}
            <div className="flex items-center text-sm md:text-base text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{dayOfWeek}, {formattedDate}</span>
            </div>

            <div className="flex items-center text-sm md:text-base text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{start_time} - {end_time}</span>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm md:text-base text-gray-600 mb-4">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>

            {/* Registration Info */}
            {max_attendees && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm md:text-base text-gray-600">
                  <span className="font-semibold text-gray-900">{current_registrations}</span> / {max_attendees} registered
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Vertical layout for dashboard grid
  return (
    <Link href={linkHref} className="block h-full">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
        {/* Poster Image */}
        <div className="relative h-48 bg-gray-100">
          {poster_url ? (
            <Image
              src={poster_url}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F44336] to-[#D32F2F]">
              <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badges */}
          {status === 'cancelled' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Cancelled
            </div>
          )}
          {status === 'completed' && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Completed
            </div>
          )}
          {is_registered && status === 'published' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Registered
            </div>
          )}
          {is_full && !is_registered && status === 'published' && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Full
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* CCA Name */}
          <div className="text-xs font-semibold text-[#F44336] mb-2 uppercase">
            {cca_name}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{dayOfWeek}, {formattedDate}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{start_time} - {end_time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{location}</span>
          </div>

          {/* Registration Info */}
          {max_attendees && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{current_registrations}</span> / {max_attendees} registered
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
