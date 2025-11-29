import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sessions/[id]/attendance - Get all attendance for session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get session to check ownership
    const { data: session } = await supabase
      .from("sessions")
      .select("cca_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData || adminData.cca_id !== session.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only CCA admins can view attendance",
        },
        { status: 403 }
      );
    }

    // Get all attendance records (only attended=true for sessions)
    const { data: attendanceRecords, error } = await supabase
      .from("attendance")
      .select("id, user_id, attended, marked_by, marked_at, created_at")
      .eq("session_id", sessionId)
      .eq("attended", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Fetch user data for each attendance record
    const enrichedAttendance = await Promise.all(
      (attendanceRecords || []).map(async (record: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(
          record.user_id
        );

        return {
          id: record.id,
          user_id: record.user_id,
          attended: record.attended,
          marked_by: record.marked_by,
          marked_at: record.marked_at,
          created_at: record.created_at,
          student: userData?.user
            ? {
                id: userData.user.id,
                name: userData.user.user_metadata?.name || "Unknown",
                student_id: userData.user.user_metadata?.student_id || "N/A",
                email: userData.user.email || "",
                phone_number: userData.user.user_metadata?.phone_number || null,
              }
            : {
                id: record.user_id,
                name: "Unknown",
                student_id: "N/A",
                email: "",
                phone_number: null,
              },
        };
      })
    );

    // Get total CCA members for context
    const { count: totalMembers } = await supabase
      .from("cca_membership")
      .select("*", { count: "exact", head: true })
      .eq("cca_id", session.cca_id);

    // Calculate summary
    const attended = enrichedAttendance.length;
    const attendance_rate =
      totalMembers && totalMembers > 0 ? (attended / totalMembers) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: enrichedAttendance,
      summary: {
        total_members: totalMembers || 0,
        total_marked: attended,
        attended,
        absent: (totalMembers || 0) - attended,
        attendance_rate: parseFloat(attendance_rate.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching session attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/sessions/[id]/attendance - Mark attendance (create records)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get session to check ownership
    const { data: session } = await supabase
      .from("sessions")
      .select("cca_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData || adminData.cca_id !== session.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only CCA admins can mark attendance",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_ids } = body; // Array of user IDs who attended

    if (!Array.isArray(user_ids)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request - user_ids must be an array",
        },
        { status: 400 }
      );
    }

    // Check for existing attendance records to avoid duplicates
    const { data: existingRecords } = await supabase
      .from("attendance")
      .select("user_id")
      .eq("session_id", sessionId)
      .in("user_id", user_ids);

    const existingUserIds = new Set(
      existingRecords?.map((r) => r.user_id) || []
    );

    // Filter out users who already have attendance records
    const newUserIds = user_ids.filter((id) => !existingUserIds.has(id));

    if (newUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All selected students already marked as attended",
        created_count: 0,
        skipped_count: user_ids.length,
      });
    }

    // Create attendance records for new attendees
    const attendanceRecords = newUserIds.map((user_id) => ({
      session_id: sessionId,
      user_id,
      attended: true,
      marked_by: user.id,
      marked_at: new Date().toISOString(),
    }));

    const { data: created, error } = await supabase
      .from("attendance")
      .insert(attendanceRecords)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${newUserIds.length} students`,
      created_count: newUserIds.length,
      skipped_count: user_ids.length - newUserIds.length,
      data: created,
    });
  } catch (error: any) {
    console.error("Error marking session attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id]/attendance - Remove attendance record (for corrections)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get session to check ownership
    const { data: session } = await supabase
      .from("sessions")
      .select("cca_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData || adminData.cca_id !== session.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only CCA admins can remove attendance",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id } = body;

    // Delete attendance record
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", user_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Attendance record removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing session attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
