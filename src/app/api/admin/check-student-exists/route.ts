import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is a system admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only system admins can check student data' },
        { status: 403 }
      );
    }

    // Get student data from request
    const body = await request.json();
    const { student_id, phone_number } = body;

    let studentIdExists = false;
    let phoneExists = false;

    // Check if student_id exists
    if (student_id) {
      const { data: studentIdData } = await supabase
        .from('student_details')
        .select('student_id')
        .eq('student_id', student_id)
        .maybeSingle();

      studentIdExists = !!studentIdData;
    }

    // Check if phone_number exists (only if provided, since it's optional)
    if (phone_number) {
      const { data: phoneData } = await supabase
        .from('student_details')
        .select('phone_number')
        .eq('phone_number', phone_number)
        .maybeSingle();

      phoneExists = !!phoneData;
    }

    return NextResponse.json({
      success: true,
      exists: studentIdExists || phoneExists,
      studentIdExists,
      phoneExists,
    });

  } catch (error: any) {
    console.error('Error checking student existence:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
