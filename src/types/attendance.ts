// ============================================================================
// ATTENDANCE TYPES
// TypeScript interfaces for the attendance table
// ============================================================================

/**
 * Attendance database record (matches attendance table)
 */
export interface Attendance {
  id: string;
  user_id: string;
  event_id: string | null;
  session_id: string | null;
  attended: boolean;
  marked_by: string | null;
  marked_at: string | null;
  created_at: string;
}

/**
 * Attendance with student details (for CCA admin viewing)
 */
export interface AttendanceWithStudent extends Attendance {
  student: {
    id: string;
    name: string;
    student_id: string;
    email: string;
    phone_number: string | null;
  };
}

/**
 * Input for marking attendance (batch update)
 */
export interface AttendanceInput {
  user_id: string;
  attended: boolean;
}

/**
 * Attendance summary statistics
 */
export interface AttendanceSummary {
  total_registered?: number; // For events only
  total_members?: number; // For sessions only
  total_marked: number;
  attended: number;
  absent: number;
  attendance_rate?: number; // Percentage (0-100)
}

/**
 * Student attendance record (for student viewing own attendance)
 */
export interface StudentAttendanceRecord {
  id: string;
  event_title?: string; // If event
  session_title?: string; // If session
  date: string;
  attended: boolean;
  type: 'event' | 'session';
}
