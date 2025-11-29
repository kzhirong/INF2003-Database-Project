import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sessions/[id]/attendance - Get all attendance for session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Get attendance records with pagination
    const { data: attendanceRecords, error, count } = await supabase
      .from("attendance")
      .select("id, user_id, attended, marked_by, marked_at", { count: 'exact' })
      .eq("session_id", sessionId)
      .order("marked_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get all user IDs
    const userIds = (attendanceRecords || []).map((r: any) => r.user_id);

    // OPTIMIZATION: Fetch student details with user emails in a single join query
    const { data: students } = await supabase
      .from('student_details')
      .select('user_id, name, student_id, phone_number, users!inner(id, email)')
      .in('user_id', userIds);

    // Create map for easy lookup
    const studentMap = new Map(students?.map((s: any) => [s.user_id, s]));

    // Enrich with student details (now includes user data from join)
    const enrichedAttendance = (attendanceRecords || []).map((record: any) => {
      const student = studentMap.get(record.user_id);
      const user = (student?.users as any)?.[0];

      return {
        id: record.id,
        user_id: record.user_id,
        attended: record.attended,
        marked_by: record.marked_by,
        marked_at: record.marked_at,
        student: {
          id: record.user_id,
          name: student?.name || 'Unknown',
          student_id: student?.student_id || 'N/A',
          email: user?.email || '',
          phone_number: student?.phone_number || null,
        },
      };
    });

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
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
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

    // OPTIMIZATION: Use batch updates instead of dangerous string concatenation
    // Step 1: Get all attendance records for this session
    const { data: allRecords } = await supabase
      .from("attendance")
      .select("user_id")
      .eq("session_id", sessionId);

    const allUserIds = (allRecords || []).map((r: any) => r.user_id);
    const absentUserIds = allUserIds.filter((id: string) => !user_ids.includes(id));

    // Step 2: Update attended users and absent users in parallel
    const updates = [];

    if (user_ids.length > 0) {
      updates.push(
        supabase
          .from("attendance")
          .update({
            attended: true,
            marked_by: user.id,
            marked_at: new Date().toISOString(),
          })
          .eq("session_id", sessionId)
          .in("user_id", user_ids)
      );
    }

    if (absentUserIds.length > 0) {
      updates.push(
        supabase
          .from("attendance")
          .update({
            attended: false,
            marked_by: null,
            marked_at: null,
          })
          .eq("session_id", sessionId)
          .in("user_id", absentUserIds)
      );
    }

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} attendance records`);
    }

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
