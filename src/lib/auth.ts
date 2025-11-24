import { createClient } from "@/lib/supabase/client";

export type UserRole = "student" | "cca_admin" | "system_admin";

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  cca_id?: string; // MongoDB ObjectId of CCA they manage

  // Student Information
  full_name: string;
  student_id?: string;
  course?: string;
  year_of_study?: number;
  phone_number?: string;
}

/**
 * Get user data including role from database (client-side)
 */
export async function getUserData(): Promise<UserData | null> {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return data as UserData;
  } catch (err) {
    console.error('Error in getUserData:', err);
    return null;
  }
}

/**
 * Check if user is a CCA admin for a specific CCA
 */
export async function isCCAAdmin(ccaId: string): Promise<boolean> {
  const userData = await getUserData();
  return userData?.role === "cca_admin" && userData?.cca_id === ccaId;
}

/**
 * Update user role and CCA assignment
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  ccaId?: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({ role, cca_id: ccaId })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return false;
  }

  return true;
}
