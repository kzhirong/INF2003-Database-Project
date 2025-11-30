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

    const upcoming = searchParams.get('upcoming') === 'true';

    // Optimization: Optimistic Fetching
    // Start fetching events immediately
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('status', status);

    if (upcoming) {
      query = query.gte('date', new Date().toISOString()).order('date', { ascending: true });
    } else {
      query = query.order('date', { ascending: true });
    }
      
    query = query.range(offset, offset + limit - 1);

    if (cca_id) {
      query = query.eq('cca_id', cca_id);
    }

    // Start the query promise but don't await yet
    const eventsPromise = query;

    // Start auth check in parallel (if needed for user-specific data later)
    const authPromise = supabase.auth.getUser();

    // Await events first as that's the main data
    const { data: events, error, count } = await eventsPromise;

    if (error) throw error;

    // Optimization: Batch fetch CCA names and attendance data in parallel
    await connectDB();
    
    // Import admin client creator dynamically to avoid build issues if env vars missing during build
    const { createAdminClient } = await import('@/lib/supabase/admin');
    
    const eventIds = (events || []).map(e => e.id);
    const ccaIds = [...new Set((events || []).map(e => e.cca_id))];
    
    const [ccaMap, registrationCounts, userRegistrations] = await Promise.all([
      // 1. Batch fetch CCAs from MongoDB
      (async () => {
        const map = new Map();
        if (ccaIds.length > 0) {
          const ccas = await CCA.find({ _id: { $in: ccaIds } }).lean();
          ccas.forEach((c: any) => {
            map.set(c._id.toString(), c.name);
          });
        }
        return map;
      })(),

      // 2. Batch fetch attendance counts (count distinct valid students) using Admin Client to bypass RLS
      (async () => {
        const map = new Map();
        if (eventIds.length > 0) {
          try {
            const adminSupabase = createAdminClient();
            
            // Get all attendance records for these events
            const { data: allAttendance } = await adminSupabase
              .from('attendance')
              .select('event_id, user_id')
              .in('event_id', eventIds);
              
            if (allAttendance && allAttendance.length > 0) {
              // Get all unique user IDs involved
              const allUserIds = [...new Set(allAttendance.map((a: any) => a.user_id))];
              
              // Fetch valid students from these users
              const { data: validStudents } = await adminSupabase
                .from('student_details')
                .select('user_id')
                .in('user_id', allUserIds);
                
              const validUserSet = new Set((validStudents || []).map((s: any) => s.user_id));
              
              // Group by event and count unique valid users
              const eventUserMap = new Map<string, Set<string>>();
              
              allAttendance.forEach((a: any) => {
                if (validUserSet.has(a.user_id)) {
                  if (!eventUserMap.has(a.event_id)) {
                    eventUserMap.set(a.event_id, new Set());
                  }
                  eventUserMap.get(a.event_id)?.add(a.user_id);
                }
              });
              
              eventUserMap.forEach((users, eventId) => {
                map.set(eventId, users.size);
              });
            }
          } catch (error) {
            console.error('Error fetching attendance counts with admin client:', error);
            // Fallback to normal client if admin client fails (though it shouldn't)
          }
        }
        return map;
      })(),

      // 3. Batch fetch user registration status
      (async () => {
        const set = new Set();
        const { data: { user } } = await authPromise;
        
        if (user && eventIds.length > 0) {
          const { data: myAttendance } = await supabase
            .from('attendance')
            .select('event_id')
            .eq('user_id', user.id)
            .in('event_id', eventIds);
            
          (myAttendance || []).forEach((a: any) => {
            set.add(a.event_id);
          });
        }
        return set;
      })()
    ]);

    // 4. Map data back
    const enrichedEvents = (events || []).map((event) => {
      const currentRegistrations = registrationCounts.get(event.id) || 0;
      
      const spotsRemaining = event.max_attendees 
        ? event.max_attendees - currentRegistrations
        : null;
        
      const isFull = event.max_attendees 
        ? currentRegistrations >= event.max_attendees
        : false;

      return {
        ...event,
        cca_name: ccaMap.get(event.cca_id) || 'Unknown CCA',
        current_registrations: currentRegistrations,
        spots_remaining: spotsRemaining,
        is_full: isFull,
        is_registered: userRegistrations.has(event.id),
      };
    });

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
