// ============================================================================
// SESSION TYPES
// TypeScript interfaces for the sessions table
// ============================================================================

/**
 * Session database record (matches sessions table)
 */
export interface Session {
  id: string;
  cca_id: string;
  title: string;
  date: string; // ISO timestamp
  start_time: string; // e.g., "19:00"
  end_time: string; // e.g., "21:00"
  location: string | null;
  notes: string | null;
  created_at: string;
}

/**
 * Session with additional details (for display)
 */
export interface SessionWithDetails extends Session {
  cca_name: string; // From MongoDB
  attendance_count?: number; // Number of students who attended
  total_members?: number; // Total CCA members
}

/**
 * Form data for creating/editing sessions
 */
export interface SessionFormData {
  cca_id: string;
  title: string;
  date: string; // ISO date string
  start_time: string;
  end_time: string;
  location: string;
  notes?: string;
}
