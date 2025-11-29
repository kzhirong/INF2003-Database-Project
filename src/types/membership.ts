// ============================================================================
// CCA MEMBERSHIP TYPES
// TypeScript interfaces for the cca_membership table
// ============================================================================

/**
 * CCA Membership database record (matches cca_membership table)
 */
export interface CCAMembership {
  id: string;
  cca_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Membership with student details (for CCA admin viewing)
 */
export interface MembershipWithStudent extends CCAMembership {
  student: {
    id: string;
    name: string;
    student_id: string;
    email: string;
    phone_number: string | null;
    course: string | null;
    year_of_study: number | null;
  };
}

/**
 * Membership with CCA details (for student viewing)
 */
export interface MembershipWithCCA extends CCAMembership {
  cca: {
    id: string;
    name: string;
    category: string;
  };
}
