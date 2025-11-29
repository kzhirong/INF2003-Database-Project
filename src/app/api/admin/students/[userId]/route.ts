import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: Fetch student details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verify System Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch student details
    const adminClient = createAdminClient();
    const { data: studentDetails, error: studentError } = await adminClient
      .from('student_details')
      .select('student_id, name, phone_number, course_id')
      .eq('user_id', userId)
      .single();

    if (studentError || !studentDetails) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Get user email from auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
    if (authError || !authUser.user) {
      return NextResponse.json({ success: false, error: 'User not found in auth' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...studentDetails,
        email: authUser.user.email
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update student details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verify System Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { email, password, name, student_id, phone_number, course_id } = body;

    const adminClient = createAdminClient();

    // Update student_details table
    const studentUpdateData: any = {};
    if (name) studentUpdateData.name = name;
    if (student_id) studentUpdateData.student_id = student_id;
    if (phone_number) studentUpdateData.phone_number = phone_number;
    if (course_id) studentUpdateData.course_id = course_id;

    if (Object.keys(studentUpdateData).length > 0) {
      const { error: detailsError } = await adminClient
        .from('student_details')
        .update(studentUpdateData)
        .eq('user_id', userId);

      if (detailsError) {
        console.error('Error updating student details:', detailsError);
        
        // Check for specific constraint violations
        if (detailsError.code === '23505') {
          if (detailsError.message.includes('student_id')) {
            return NextResponse.json({ success: false, error: 'Student ID already exists' }, { status: 400 });
          }
          if (detailsError.message.includes('phone_number')) {
            return NextResponse.json({ success: false, error: 'Phone number already exists' }, { status: 400 });
          }
        }
        
        return NextResponse.json({ success: false, error: detailsError.message }, { status: 500 });
      }
    }

    // Update auth user credentials if provided
    const updateAttributes: any = {};
    if (email) updateAttributes.email = email;
    if (password) updateAttributes.password = password;

    if (Object.keys(updateAttributes).length > 0) {
      // Check for duplicate email before attempting update
      if (email) {
        const { data: existingUser } = await adminClient
          .from('users')
          .select('id')
          .eq('email', email)
          .neq('id', userId)
          .maybeSingle();
        
        if (existingUser) {
          return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
        }
      }

      if (email) updateAttributes.email_confirm = true;

      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, updateAttributes);

      if (authError) {
        console.error('Error updating auth user:', authError);
        console.error('Full error object:', JSON.stringify(authError, null, 2));
        
        // Provide more specific error messages
        let errorMessage = 'Failed to update account credentials';
        
        const errorMsg = authError.message?.toLowerCase() || '';
        
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
          errorMessage = 'Email update failed: ' + authError.message;
        } else {
          errorMessage = authError.message || 'Failed to update account credentials';
        }
        
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
      }

      // Sync email to public users table if changed
      if (email) {
        const { error: publicUpdateError } = await adminClient
          .from('users')
          .update({ email: email })
          .eq('id', userId);

        if (publicUpdateError) {
          console.error('Failed to sync email to public users table:', publicUpdateError);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
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

    const adminClient = createAdminClient();

    // Delete from public users table first
    const { error: deletePublicError } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (deletePublicError) {
      console.error('Error deleting from public users table:', deletePublicError);
      // Continue to delete from Auth even if this fails
    }

    // Delete the user from Supabase Auth (this should cascade to student_details via FK)
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error deleting student from Auth:', deleteAuthError);
      return NextResponse.json(
        { success: false, error: `Failed to delete student account: ${deleteAuthError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Student deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
