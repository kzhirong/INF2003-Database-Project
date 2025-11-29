import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ccaId } = await params;
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

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from('cca_admin_details')
      .select('cca_id')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.cca_id !== ccaId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Optimization: Run independent queries in parallel
    const [
      { count: memberCount },
      { count: sessionCount },
      { count: eventCount },
      { data: sessions },
      { data: events }
    ] = await Promise.all([
      // 1. Get Member Count
      supabase
        .from('cca_membership')
        .select('*', { count: 'exact', head: true })
        .eq('cca_id', ccaId),

      // 2. Get Session Count
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('cca_id', ccaId),

      // 3. Get Event Count
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('cca_id', ccaId),

      // 4. Get Sessions for Trends
      supabase
        .from('sessions')
        .select('id, date, title')
        .eq('cca_id', ccaId)
        .order('date', { ascending: true }),

      // 5. Get Events for Trends
      supabase
        .from('events')
        .select('id, date, title')
        .eq('cca_id', ccaId)
        .order('date', { ascending: true })
    ]);

    const sessionIds = sessions?.map((s) => s.id) || [];
    const eventIds = events?.map((e) => e.id) || [];

    let totalAttendanceRecords = 0;
    let totalPresent = 0;
    const trendData: any[] = [];

    // Process Sessions
    if (sessionIds.length > 0) {
      const { data: sessionAtt } = await supabase
        .from('attendance')
        .select('session_id, attended')
        .in('session_id', sessionIds);

      if (sessionAtt) {
        totalAttendanceRecords += sessionAtt.length;
        totalPresent += sessionAtt.filter((r) => r.attended).length;

        // OPTIMIZATION: Group attendance records once instead of filtering per session
        const recordsBySession = sessionAtt.reduce((acc: Record<string, any[]>, r) => {
          if (!acc[r.session_id]) acc[r.session_id] = [];
          acc[r.session_id].push(r);
          return acc;
        }, {});

        // Build trend data from grouped records
        sessions?.forEach((session) => {
          const records = recordsBySession[session.id] || [];
          if (records.length > 0) {
            const present = records.filter((r) => r.attended).length;
            const rate = (present / records.length) * 100;
            trendData.push({
              date: session.date,
              title: session.title || 'Session',
              type: 'Session',
              rate: parseFloat(rate.toFixed(1)),
              present,
              total: records.length,
            });
          }
        });
      }
    }

    // Process Events
    if (eventIds.length > 0) {
      const { data: eventAtt } = await supabase
        .from('attendance')
        .select('event_id, attended')
        .in('event_id', eventIds);

      if (eventAtt) {
        totalAttendanceRecords += eventAtt.length;
        totalPresent += eventAtt.filter((r) => r.attended).length;

        // OPTIMIZATION: Group attendance records once instead of filtering per event
        const recordsByEvent = eventAtt.reduce((acc: Record<string, any[]>, r) => {
          if (!acc[r.event_id]) acc[r.event_id] = [];
          acc[r.event_id].push(r);
          return acc;
        }, {});

        // Build trend data from grouped records
        events?.forEach((event) => {
          const records = recordsByEvent[event.id] || [];
          if (records.length > 0) {
            const present = records.filter((r) => r.attended).length;
            const rate = (present / records.length) * 100;
            trendData.push({
              date: event.date,
              title: event.title,
              type: 'Event',
              rate: parseFloat(rate.toFixed(1)),
              present,
              total: records.length,
            });
          }
        });
      }
    }

    // Sort trend data by date
    trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const averageAttendance =
      totalAttendanceRecords > 0
        ? (totalPresent / totalAttendanceRecords) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        memberCount: memberCount || 0,
        sessionCount: sessionCount || 0,
        eventCount: eventCount || 0,
        averageAttendance: parseFloat(averageAttendance.toFixed(1)),
        trendData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
