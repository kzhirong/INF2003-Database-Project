import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET all students
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all students with their details
    const adminClient = createAdminClient();
    const { data: students, error } = await adminClient
      .from('student_details')
      .select(`
        student_id,
        name,
        phone_number,
        user_id,
        users!inner (
          email
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Transform the data to flatten the structure
    const transformedStudents = students?.map(student => ({
      user_id: student.user_id,
      student_id: student.student_id,
      name: student.name,
      phone_number: student.phone_number,
      email: (student.users as any)?.email || 'N/A'
    })) || [];

    return NextResponse.json({ success: true, data: transformedStudents }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
