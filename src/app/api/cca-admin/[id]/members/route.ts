import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.id;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is CCA admin or system admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'cca_admin' && userData.role !== 'system_admin')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - CCA admin or system admin role required' },
        { status: 403 }
      );
    }

    // Use RPC or raw query to join tables properly
    const { data: members, error: membersError } = await supabase.rpc('get_cca_members', {
      p_cca_id: ccaId
    });

    if (membersError) {
      console.error('Error fetching members:', membersError);

      // Fallback to simple query if RPC doesn't exist
      const { data: fallbackMembers, error: fallbackError } = await supabase
        .from('cca_membership')
        .select('id, user_id, created_at')
        .eq('cca_id', ccaId);

      if (fallbackError) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch members' },
          { status: 500 }
        );
      }

      // Fetch student details for each member
      const transformedMembers = await Promise.all(
        (fallbackMembers || []).map(async (m: any) => {
          const { data: studentData } = await supabase
            .from('student_details')
            .select('student_id, name, phone_number, course_id')
            .eq('user_id', m.user_id)
            .single();

          const { data: courseData } = studentData?.course_id
            ? await supabase
                .from('courses')
                .select('course_name')
                .eq('id', studentData.course_id)
                .single()
            : { data: null };

          return {
            enrollment_id: m.id,
            user_id: m.user_id,
            student_id: studentData?.student_id || 'Unknown',
            name: studentData?.name || 'Unknown',
            phone_number: studentData?.phone_number || '',
            course_name: courseData?.course_name || 'Unknown',
            created_at: m.created_at
          };
        })
      );

      const totalMembers = transformedMembers.length;
      return NextResponse.json({
        success: true,
        data: transformedMembers.sort((a, b) => a.name.localeCompare(b.name)),
        stats: {
          totalMembers,
          activeMembers: totalMembers
        }
      });
    }

    // If RPC succeeded, use that data
    const transformedMembers = (members || []).sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );

    // Calculate stats
    const totalMembers = transformedMembers.length;

    return NextResponse.json({
      success: true,
      data: transformedMembers,
      stats: {
        totalMembers,
        activeMembers: totalMembers // All members are active (no status field)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/cca-admin/[id]/members:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.id;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is CCA admin or system admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'cca_admin' && userData.role !== 'system_admin')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - CCA admin or system admin role required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { student_id } = body;

    if (!student_id || typeof student_id !== 'string' || !/^\d{7}$/.test(student_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID format (must be 7 digits)' },
        { status: 400 }
      );
    }

    // Look up user_id from student_id
    // Note: student_details.user_id references public.users(id), which should match auth.users(id)
    const { data: studentData, error: studentError } = await supabase
      .from('student_details')
      .select('user_id')
      .eq('student_id', student_id)
      .maybeSingle();

    if (studentError) {
      console.error('Student lookup error:', studentError);
      return NextResponse.json(
        { success: false, error: 'Database error while looking up student' },
        { status: 500 }
      );
    }

    if (!studentData) {
      return NextResponse.json(
        { success: false, error: 'Student ID not found in system' },
        { status: 404 }
      );
    }

    // Verify the user is a student (application-level validation)
    const { data: userRoleData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', studentData.user_id)
      .maybeSingle();

    if (roleError) {
      console.error('User role check error:', roleError);
      return NextResponse.json(
        { success: false, error: 'Database error while checking user role' },
        { status: 500 }
      );
    }

    if (!userRoleData || userRoleData.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Only students can be enrolled in CCAs' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('cca_membership')
      .select('id')
      .eq('user_id', studentData.user_id)
      .eq('cca_id', ccaId)
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Student is already enrolled in this CCA' },
        { status: 400 }
      );
    }

    // Insert enrollment
    const { data: enrollment, error: insertError } = await supabase
      .from('cca_membership')
      .insert({
        user_id: studentData.user_id,
        cca_id: ccaId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting enrollment:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to add member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollment
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/cca-admin/[id]/members:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
