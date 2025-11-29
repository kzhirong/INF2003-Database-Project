import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongoose";
import CCA from "@/models/CCA";

// GET /api/sessions/[id] - Get single session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: session, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    // Get CCA name from MongoDB
    await connectDB();
    const cca = await CCA.findById(session.cca_id).lean();

    // Get attendance count
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

    const enrichedSession = {
      ...session,
      cca_name: cca?.name || "Unknown CCA",
      attendance_count: attendanceCount || 0,
      total_members: totalMembers || 0,
    };

    return NextResponse.json({
      success: true,
      data: enrichedSession,
    });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update session (CCA admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq("id", id)
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
          error: "Forbidden - You can only edit sessions for your CCA",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update session
    const { data: updatedSession, error } = await supabase
      .from("sessions")
      .update({
        title: body.title,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        notes: body.notes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error: any) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete session (CCA admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .eq("id", id)
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
          error: "Forbidden - You can only delete sessions for your CCA",
        },
        { status: 403 }
      );
    }

    // Delete session (cascade deletes attendance records)
    const { error } = await supabase.from("sessions").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
