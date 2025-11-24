import { EventsBlock } from "@/types/blocks";

interface EventsBlockRendererProps {
  block: EventsBlock;
}

export default function EventsBlockRenderer({ block }: EventsBlockRendererProps) {
  const { title, events, layout = 'grid' } = block.config;

  const layoutClasses = layout === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      )}

      <div className={layoutClasses}>
        {events.map((event, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h4 className="text-xl font-bold text-[#F44336] mb-3">{event.title}</h4>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{event.date}</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            </div>

            {event.description && (
              <p className="mt-4 text-gray-700">{event.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
