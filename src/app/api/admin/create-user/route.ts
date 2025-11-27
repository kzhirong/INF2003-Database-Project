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
    const { email, password, role, name, student_id, course, year_of_study, phone_number, cca_id } = body;

    // Create admin client
    const adminClient = createAdminClient();

    // Create user using admin client (doesn't affect current session)
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role,
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

    // Update the user's role in the users table (no name - comes from detail tables)
    const { error: updateError } = await adminClient
      .from('users')
      .update({ role })
      .eq('id', newUser.user.id);

    if (updateError) {
      console.error('Error updating user data:', updateError);
      return NextResponse.json(
        { success: false, error: `User created but failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    // If CCA admin, insert into cca_admin_details
    if (role === 'cca_admin' && cca_id) {
      const { error: adminDetailsError } = await adminClient
        .from('cca_admin_details')
        .insert({ user_id: newUser.user.id, cca_id });

      if (adminDetailsError) {
        console.error('Error creating CCA admin details:', adminDetailsError);
        return NextResponse.json(
          { success: false, error: `User created but failed to create CCA admin details: ${adminDetailsError.message}` },
          { status: 500 }
        );
      }
    }

    // If student, insert into student_details (including name)
    if (role === 'student') {
      const { error: studentDetailsError } = await adminClient
        .from('student_details')
        .insert({
          user_id: newUser.user.id,
          name: name || 'Student',
          student_id: student_id || '',
          course: course || '',
          year_of_study: year_of_study ? parseInt(year_of_study) : 1,
          phone_number: phone_number || null,
        });

      if (studentDetailsError) {
        console.error('Error creating student details:', studentDetailsError);
        return NextResponse.json(
          { success: false, error: `User created but failed to create student details: ${studentDetailsError.message}` },
          { status: 500 }
        );
      }
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
