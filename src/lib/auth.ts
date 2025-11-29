import { createClient } from "@/lib/supabase/client";

export type UserRole = "student" | "cca_admin" | "system_admin";

export interface UserData {
  id: string;
  email: string;
  role: UserRole;

  // Name - comes from different sources based on role:
  // - Students: from student_details.name
  // - CCA Admins: from MongoDB CCA document
  // - System Admins: from email or hardcoded
  name?: string;

  // CCA Admin specific (from cca_admin_details JOIN + MongoDB)
  cca_id?: string; // MongoDB ObjectId of CCA they manage

  // Student specific (from student_details JOIN)
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

    // Get base user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return null;
    }

    // If CCA admin, get their CCA ID and fetch CCA name from MongoDB
    if (userData.role === 'cca_admin') {
      const { data: adminData } = await supabase
        .from("cca_admin_details")
        .select("cca_id")
        .eq("user_id", user.id)
        .single();

      let ccaName = "CCA Admin";

      // Fetch CCA name from MongoDB API
      if (adminData?.cca_id) {
        try {
          const response = await fetch(`/api/ccas/${adminData.cca_id}`);
          const ccaData = await response.json();
          if (ccaData.success && ccaData.data?.name) {
            ccaName = ccaData.data.name;
          }
        } catch (err) {
          console.error('Error fetching CCA name:', err);
        }
      }

      return {
        ...userData,
        cca_id: adminData?.cca_id,
        name: ccaName
      } as UserData;
    }

    // If student, get their student details (including name)
    if (userData.role === 'student') {
      const { data: studentData } = await supabase
        .from("student_details")
        .select("name, student_id, phone_number")
        .eq("user_id", user.id)
        .single();

      return {
        ...userData,
        ...studentData
      } as UserData;
    }

    // System admin - just return base user data with admin name
    return {
      ...userData,
      name: "System Administrator"
    } as UserData;
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
 * NOTE: This function is deprecated with the new schema structure.
 * Use specific functions for creating CCA admins and students instead.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  ccaId?: string
): Promise<boolean> {
  const supabase = createClient();

  // Update base user role
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return false;
  }

  // If updating to CCA admin, update/insert cca_admin_details
  if (role === 'cca_admin' && ccaId) {
    const { error: adminError } = await supabase
      .from("cca_admin_details")
      .upsert({ user_id: userId, cca_id: ccaId });

    if (adminError) {
      console.error("Error updating CCA admin details:", adminError);
      return false;
    }
  }

  return true;
}
