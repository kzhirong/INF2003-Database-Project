import { useEffect, useState } from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TimePicker({ value, onChange, className = "" }: TimePickerProps) {
  // Parse initial value (HH:mm) or default to 12:00 PM
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "12", minute: "00", period: "PM" };
    const [h, m] = timeStr.split(":");
    let hourInt = parseInt(h, 10);
    const period = hourInt >= 12 ? "PM" : "AM";
    
    if (hourInt > 12) hourInt -= 12;
    if (hourInt === 0) hourInt = 12;
    
    return {
      hour: hourInt.toString().padStart(2, "0"),
      minute: m,
      period
    };
  };

  const [timeState, setTimeState] = useState(parseTime(value));

  // Update local state when prop changes
  useEffect(() => {
    setTimeState(parseTime(value));
  }, [value]);

  const handleChange = (field: "hour" | "minute" | "period", newValue: string) => {
    const newState = { ...timeState, [field]: newValue };
    setTimeState(newState);

    // Convert back to 24h format for parent
    let hourInt = parseInt(newState.hour, 10);
    if (newState.period === "PM" && hourInt !== 12) hourInt += 12;
    if (newState.period === "AM" && hourInt === 12) hourInt = 0;

    const timeStr = `${hourInt.toString().padStart(2, "0")}:${newState.minute}`;
    onChange(timeStr);
  };

  // Generate options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")); // 5 minute intervals

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative">
        <select
          value={timeState.hour}
          onChange={(e) => handleChange("hour", e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent cursor-pointer"
        >
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <span className="self-center text-gray-500 font-bold">:</span>

      <div className="relative">
        <select
          value={timeState.minute}
          onChange={(e) => handleChange("minute", e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent cursor-pointer"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="relative">
        <select
          value={timeState.period}
          onChange={(e) => handleChange("period", e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent cursor-pointer"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
