import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

// GET /api/events - List all published events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cca_id = searchParams.get('cca_id');
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (cca_id) {
      query = query.eq('cca_id', cca_id);
    }

    const { data: events, error, count } = await query;

    if (error) throw error;

    // Enrich with CCA names and registration counts
    await connectDB();
    const enrichedEvents = await Promise.all(
      (events || []).map(async (event) => {
        // Get CCA name from MongoDB
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

        return {
          ...event,
          cca_name: cca?.name || 'Unknown CCA',
          current_registrations: currentRegistrations || 0,
          spots_remaining: spotsRemaining,
          is_full: isFull,
          is_registered: isRegistered,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedEvents,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (CCA admin only)
export async function POST(request: NextRequest) {
  try {
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

    // Check if user is CCA admin
    const { data: adminData } = await supabase
      .from('cca_admin_details')
      .select('cca_id')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only CCA admins can create events' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verify user is admin of this CCA
    if (body.cca_id !== adminData.cca_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only create events for your CCA' },
        { status: 403 }
      );
    }

    // Insert event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        cca_id: body.cca_id,
        title: body.title,
        description: body.description,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        poster_url: body.poster_url,
        max_attendees: body.max_attendees,
        registration_deadline: body.registration_deadline,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
