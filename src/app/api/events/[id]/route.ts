import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

// GET /api/events/[id] - Get single event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get CCA name from MongoDB
    await connectDB();
    const cca = await CCA.findById(event.cca_id).lean();

    // Get registration count directly from attendance table
    const { count: currentRegistrations } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);

    // Calculate spots remaining and is_full
    const spotsRemaining = event.max_attendees 
      ? event.max_attendees - (currentRegistrations || 0)
      : null;
    const isFull = event.max_attendees 
      ? (currentRegistrations || 0) >= event.max_attendees
      : false;

    // Check if current user is registered
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isRegistered = false;
    if (user) {
      const { data: reg } = await supabase
        .from('attendance')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();
      isRegistered = !!reg;
    }

    const enrichedEvent = {
      ...event,
      cca_name: cca?.name || 'Unknown CCA',
      current_registrations: currentRegistrations || 0,
      spots_remaining: spotsRemaining,
      is_full: isFull,
      is_registered: isRegistered,
    };

    return NextResponse.json({
      success: true,
      data: enrichedEvent,
    });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event (CCA admin only)
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get event to check ownership
    const { data: event } = await supabase
      .from('events')
      .select('cca_id')
      .eq('id', id)
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
        { success: false, error: 'Forbidden - You can only edit events for your CCA' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update event
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        title: body.title,
        description: body.description,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        poster_url: body.poster_url,
        max_attendees: body.max_attendees,
        registration_deadline: body.registration_deadline,
        status: body.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event (CCA admin only)
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get event to check ownership
    const { data: event } = await supabase
      .from('events')
      .select('cca_id')
      .eq('id', id)
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
        { success: false, error: 'Forbidden - You can only delete events for your CCA' },
        { status: 403 }
      );
    }

    // Delete event (cascade deletes attendance records)
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
