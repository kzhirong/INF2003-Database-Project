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
    const { email, password, role, name, student_id, course_id, phone_number, cca_id } = body;

    // Create admin client
    const adminClient = createAdminClient();

    // Check for duplicates before creating user (for students)
    if (role === 'student') {
      if (student_id) {
        const { data: existingId } = await adminClient
          .from('student_details')
          .select('id')
          .eq('student_id', student_id)
          .maybeSingle();
        
        if (existingId) {
          return NextResponse.json(
            { success: false, error: 'Student ID already exists' },
            { status: 400 }
          );
        }
      }

      if (phone_number) {
        const { data: existingPhone } = await adminClient
          .from('student_details')
          .select('id')
          .eq('phone_number', phone_number)
          .maybeSingle();
        
        if (existingPhone) {
          return NextResponse.json(
            { success: false, error: 'Phone number already exists' },
            { status: 400 }
          );
        }
      }
    }

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
      console.error('Full error object:', JSON.stringify(createError, null, 2));
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create user account';
      
      const errorMsg = createError.message?.toLowerCase() || '';
      
      // Check for duplicate email
      if (errorMsg.includes('already') || 
          errorMsg.includes('exists') ||
          errorMsg.includes('duplicate') ||
          errorMsg.includes('unique') ||
          errorMsg.includes('constraint')) {
        errorMessage = 'Email already exists';
      } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
        errorMessage = 'Invalid email format';
      } else if (errorMsg.includes('email')) {
        errorMessage = 'Email error: ' + createError.message;
      } else {
        errorMessage = createError.message || 'Failed to create user account';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
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
      // Rollback: Delete the created user
      await adminClient.auth.admin.deleteUser(newUser.user.id);
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
        // Rollback: Delete the created user
        await adminClient.auth.admin.deleteUser(newUser.user.id);
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
          course_id: course_id || '',
          phone_number: phone_number || null,
        });

      if (studentDetailsError) {
        console.error('Error creating student details:', studentDetailsError);
        // Rollback: Delete the created user
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        
        // Return specific error message if it's a constraint violation
        if (studentDetailsError.code === '23505') { // Unique violation
           if (studentDetailsError.message.includes('student_id')) {
             return NextResponse.json({ success: false, error: 'Student ID already exists' }, { status: 400 });
           }
           if (studentDetailsError.message.includes('phone_number')) {
             return NextResponse.json({ success: false, error: 'Phone number already exists' }, { status: 400 });
           }
        }

        return NextResponse.json(
          { success: false, error: `Failed to create student details: ${studentDetailsError.message}` },
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
