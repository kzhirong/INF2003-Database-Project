import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
        { success: false, error: 'Forbidden - Only system admins can create users' },
        { status: 403 }
      );
    }

    // Get user data from request
    const body = await request.json();
    const { email, password, role, full_name, student_id, course, year_of_study, phone_number, cca_id } = body;

    // Create admin client
    const adminClient = createAdminClient();

    // Create user using admin client (doesn't affect current session)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role,
        full_name,
        student_id,
        course,
        year_of_study,
        phone_number,
        cca_id,
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      );
    }

    // Wait for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the user's role and other fields in the users table
    const updateData: any = { role, full_name };
    if (student_id) updateData.student_id = student_id;
    if (course) updateData.course = course;
    if (year_of_study) updateData.year_of_study = year_of_study;
    if (phone_number) updateData.phone_number = phone_number;
    if (cca_id) updateData.cca_id = cca_id;

    const { error: updateError } = await adminClient
      .from('users')
      .update(updateData)
      .eq('id', newUser.user.id);

    if (updateError) {
      console.error('Error updating user data:', updateError);
      return NextResponse.json(
        { success: false, error: `User created but failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.user.id,
        email: newUser.user.email,
        role,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create-user API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
