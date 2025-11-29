import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/events/[id]/attendance - Get all registrations/attendance for event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get event to check ownership
    const { data: event } = await supabase
      .from('events')
      .select('cca_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from('cca_admin_details')
      .select('cca_id')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.cca_id !== event.cca_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only CCA admins can view attendance' },
        { status: 403 }
      );
    }

    // Get all attendance records (no join - we'll enrich separately)
    const { data: attendanceRecords, error } = await supabase
      .from('attendance')
      .select('id, user_id, attended, marked_by, marked_at')
      .eq('event_id', eventId)
      .order('marked_at', { ascending: true });

    if (error) throw error;

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: {
          total_registered: 0,
          total_marked: 0,
          attended: 0,
          absent: 0,
          attendance_rate: 0,
        },
      });
    }

    // Get all user IDs
    const userIds = attendanceRecords.map((r: any) => r.user_id);

    // Fetch student details directly
    const { data: students } = await supabase
      .from('student_details')
      .select('user_id, name, student_id, phone_number')
      .in('user_id', userIds);

    // Fetch user emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    // Create maps for easy lookup
    const studentMap = new Map(students?.map((s: any) => [s.user_id, s]));
    const userMap = new Map(users?.map((u: any) => [u.id, u]));

    // Enrich with student details
    const enrichedAttendance = attendanceRecords.map((record: any) => {
      const student = studentMap.get(record.user_id);
      const user = userMap.get(record.user_id);
      
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
    const total_registered = enrichedAttendance.length;
    const attended = enrichedAttendance.filter((r) => r.attended).length;
    const absent = total_registered - attended;
    const attendance_rate =
      total_registered > 0 ? (attended / total_registered) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: enrichedAttendance,
      summary: {
        total_registered,
        total_marked: enrichedAttendance.filter((r) => r.marked_at).length,
        attended,
        absent,
        attendance_rate: parseFloat(attendance_rate.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching event attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/attendance - Mark attendance (batch update)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get event to check ownership
    const { data: event } = await supabase
      .from('events')
      .select('cca_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from('cca_admin_details')
      .select('cca_id')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.cca_id !== event.cca_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only CCA admins can mark attendance' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { attendance } = body; // Array of { user_id, attended }

    if (!Array.isArray(attendance)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request - attendance must be an array' },
        { status: 400 }
      );
    }

    // Update attendance records
    const updates = attendance.map((record) =>
      supabase
        .from('attendance')
        .update({
          attended: record.attended,
          marked_by: user.id,
          marked_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .eq('user_id', record.user_id)
    );

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} records`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated attendance for ${attendance.length} students`,
      updated_count: attendance.length,
    });
  } catch (error: any) {
    console.error('Error marking event attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/attendance - Update single attendance record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get event to check ownership
    const { data: event } = await supabase
      .from('events')
      .select('cca_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from('cca_admin_details')
      .select('cca_id')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.cca_id !== event.cca_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only CCA admins can mark attendance' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, attended } = body;

    // Update single attendance record
    const { data: updated, error } = await supabase
      .from('attendance')
      .update({
        attended,
        marked_by: user.id,
        marked_at: new Date().toISOString(),
      })
      .eq('event_id', eventId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Attendance updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating event attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
