import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongoose";
import CCA from "@/models/CCA";

// GET /api/sessions - List sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cca_id = searchParams.get("cca_id");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("sessions")
      .select("*", { count: "exact" })
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (cca_id) {
      query = query.eq("cca_id", cca_id);
    }

    const { data: sessions, error, count } = await query;

    if (error) throw error;

    // Enrich with CCA names and attendance counts
    await connectDB();
    const enrichedSessions = await Promise.all(
      (sessions || []).map(async (session) => {
        // Get CCA name from MongoDB
        const cca = await CCA.findById(session.cca_id).lean();

        // Get attendance count (only attended = true)
        const { count: attendanceCount } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("attended", true);

        // Get total CCA members
        const { count: totalMembers } = await supabase
          .from("cca_membership")
          .select("*", { count: "exact", head: true })
          .eq("cca_id", session.cca_id);

        return {
          ...session,
          cca_name: cca?.name || "Unknown CCA",
          attendance_count: attendanceCount || 0,
          total_members: totalMembers || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedSessions,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create new session (CCA admin only)
export async function POST(request: NextRequest) {
  try {
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

    // Check if user is CCA admin
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only CCA admins can create sessions",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verify user is admin of this CCA
    if (body.cca_id !== adminData.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - You can only create sessions for your CCA",
        },
        { status: 403 }
      );
    }

    // Insert session
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        cca_id: body.cca_id,
        title: body.title,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-create attendance records for all CCA members (attended = false)
    const { data: members, error: membersError } = await supabase
      .from("cca_membership")
      .select("user_id")
      .eq("cca_id", body.cca_id);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      // Continue even if member fetch fails - session is already created
    } else if (members && members.length > 0) {
      const attendanceRecords = members.map((member) => ({
        session_id: session.id,
        user_id: member.user_id,
        attended: false,
      }));

      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert(attendanceRecords);

      if (attendanceError) {
        console.error("Error creating attendance records:", attendanceError);
        // Continue even if attendance creation fails - session is created
      }
    }

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
