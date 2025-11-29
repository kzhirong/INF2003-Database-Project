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

    // Get ALL attendance records (both attended and not attended)
    const { data: attendanceRecords, error } = await supabase
      .from("attendance")
      .select("id, user_id, attended, marked_by, marked_at")
      .eq("session_id", sessionId)
      .order("marked_at", { ascending: true });

    if (error) throw error;

    // Fetch student details from users and student_details tables
    const enrichedAttendance = await Promise.all(
      (attendanceRecords || []).map(async (record: any) => {
        const { data: userData } = await supabase
          .from('users')
          .select(`
            id,
            email,
            student_details:student_details(name, student_id, phone_number)
          `)
          .eq('id', record.user_id)
          .single();

        const studentDetails = (userData?.student_details as any)?.[0];

        return {
          id: record.id,
          user_id: record.user_id,
          attended: record.attended,
          marked_by: record.marked_by,
          marked_at: record.marked_at,
          student: studentDetails
            ? {
                id: record.user_id,
                name: studentDetails.name || "Unknown",
                student_id: studentDetails.student_id || "N/A",
                email: userData?.email || "",
                phone_number: studentDetails.phone_number || null,
              }
            : {
                id: record.user_id,
                name: "Unknown",
                student_id: "N/A",
                email: userData?.email || "",
                phone_number: null,
              },
        };
      })
    );

    // Get total from attendance records
    const totalMarked = enrichedAttendance.filter(rec => rec.attended).length;
    const { count: totalCCAMembers } = await supabase
      .from("cca_membership")
      .select("*", { count: "exact", head: true })
      .eq("cca_id", session.cca_id);

    // Calculate summary
    const totalMembers = enrichedAttendance.length;
    const attended = enrichedAttendance.filter(rec => rec.attended).length;
    const absent = totalMembers - attended;
    const attendance_rate =
      totalMembers && totalMembers > 0 ? (attended / totalMembers) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: enrichedAttendance,
      summary: {
        total_members: totalMembers,
        total_marked: totalMembers,
        attended,
        absent,
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

    // Since records are pre-created, we UPDATE them instead of INSERT
    // Step 1: Mark selected users as attended = true
    if (user_ids.length > 0) {
      const { error: updateError } = await supabase
        .from("attendance")
        .update({
          attended: true,
          marked_by: user.id,
          marked_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .in("user_id", user_ids);

      if (updateError) throw updateError;
    }

    // Step 2: Mark unselected users as attended = false
    const { error: resetError } = await supabase
      .from("attendance")
      .update({
        attended: false,
        marked_by: null,
        marked_at: null,
      })
      .eq("session_id", sessionId)
      .not("user_id", "in", `(${user_ids.length > 0 ? user_ids.map(id => `"${id}"`).join(",") : '""'})`);

    if (resetError) throw resetError;

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${user_ids.length} students`,
      attended_count: user_ids.length,
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
