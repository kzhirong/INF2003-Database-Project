// ============================================================================
// EVENT TYPES
// TypeScript interfaces for the events table and related data
// ============================================================================

/**
 * Event database record (matches events table)
 */
export interface Event {
  id: string;
  cca_id: string;
  title: string;
  description: string | null;
  date: string; // ISO timestamp
  start_time: string; // e.g., "18:00"
  end_time: string; // e.g., "21:00"
  location: string;
  poster_url: string | null;
  max_attendees: number | null;
  registration_deadline: string | null; // ISO timestamp
  status: 'published' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

/**
 * Event with additional computed fields (for display)
 */
export interface EventWithDetails extends Event {
  cca_name: string; // From MongoDB
  current_registrations: number;
  spots_remaining: number | null;
  is_full: boolean;
  is_registered?: boolean; // If current user is registered
}

/**
 * Form data for creating/editing events
 */
export interface EventFormData {
  cca_id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  start_time: string;
  end_time: string;
  location: string;
  poster_url?: string;
  max_attendees?: number;
  registration_deadline?: string;
}

/**
 * Event registration summary (from view)
 */
export interface EventRegistrationSummary {
  id: string;
  cca_id: string;
  title: string;
  date: string;
  max_attendees: number | null;
  current_registrations: number;
  spots_remaining: number | null;
  is_full: boolean;
}

/**
 * Event attendance summary (from view)
 */
export interface EventAttendanceSummary {
  id: string;
  title: string;
  total_registered: number;
  total_attended: number;
  total_absent: number;
  attendance_rate: number; // Percentage (0-100)
}
