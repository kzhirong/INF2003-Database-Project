"use client";

import { EventsBlock, EventItem } from "@/types/blocks";

interface EventsBlockEditorProps {
  block: EventsBlock;
  onUpdate: (block: EventsBlock) => void;
}

export default function EventsBlockEditor({ block, onUpdate }: EventsBlockEditorProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, title }
    });
  };

  const handleLayoutChange = (layout: "list" | "grid") => {
    onUpdate({
      ...block,
      config: { ...block.config, layout }
    });
  };

  const handleAddEvent = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        events: [
          ...block.config.events,
          { title: "", date: "", time: "", location: "", description: "" }
        ]
      }
    });
  };

  const handleRemoveEvent = (index: number) => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        events: block.config.events.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateEvent = (index: number, field: keyof EventItem, value: string) => {
    const updatedEvents = [...block.config.events];
    updatedEvents[index][field] = value;
    onUpdate({
      ...block,
      config: { ...block.config, events: updatedEvents }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title (Optional)
          </label>
          <input
            type="text"
            value={block.config.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
            placeholder="e.g., Upcoming Events"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <div className="flex gap-2">
            {(["list", "grid"] as const).map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => handleLayoutChange(layout)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  block.config.layout === layout
                    ? "bg-[#F44336] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {layout.charAt(0).toUpperCase() + layout.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Events
        </label>
        <div className="space-y-4">
          {block.config.events.map((event, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">Event {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(index)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => handleUpdateEvent(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) => handleUpdateEvent(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input
                    type="text"
                    value={event.time}
                    onChange={(e) => handleUpdateEvent(index, 'time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., 2:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) => handleUpdateEvent(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={event.description}
                  onChange={(e) => handleUpdateEvent(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddEvent}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + Add Event
          </button>
        </div>
      </div>
    </div>
  );
}
