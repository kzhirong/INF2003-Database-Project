import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/events/[id]/register - Register student for event
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
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if event exists
    const { data: event } = await supabase
      .from('events')
      .select('id, title, max_attendees, registration_deadline, status')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is published
    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'This event is no longer accepting registrations' },
        { status: 400 }
      );
    }

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('attendance')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingReg) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Insert registration (trigger will check capacity and deadline)
    const { data: registration, error } = await supabase
      .from('attendance')
      .insert({
        event_id: eventId,
        user_id: user.id,
        attended: false, // Default: registered but not yet attended
      })
      .select()
      .single();

    if (error) {
      // The trigger will throw specific errors
      if (error.message.includes('deadline')) {
        return NextResponse.json(
          { success: false, error: 'Registration deadline has passed' },
          { status: 400 }
        );
      }
      if (error.message.includes('capacity')) {
        return NextResponse.json(
          { success: false, error: 'Event is at full capacity' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        registration_id: registration.id,
        event_id: eventId,
        user_id: user.id,
        registered_at: registration.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
