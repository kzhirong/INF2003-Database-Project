import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: Fetch CCA Admin email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ccaId: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.ccaId;

    // 1. Verify System Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Find User ID for this CCA
    const adminClient = createAdminClient();
    const { data: ccaAdminDetails, error: findError } = await adminClient
      .from('cca_admin_details')
      .select('user_id')
      .eq('cca_id', ccaId)
      .single();

    if (findError || !ccaAdminDetails) {
      return NextResponse.json({ success: false, error: 'No admin user found for this CCA' }, { status: 404 });
    }

    // 3. Get User Email
    const { data: targetUser, error: userError } = await adminClient.auth.admin.getUserById(ccaAdminDetails.user_id);

    if (userError || !targetUser.user) {
      return NextResponse.json({ success: false, error: 'User not found in auth' }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: targetUser.user.email });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update CCA Admin credentials
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ccaId: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.ccaId;

    // 1. Verify System Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get Request Body
    const body = await request.json();
    const { email, password } = body;

    // 3. Find User ID for this CCA
    const adminClient = createAdminClient();
    const { data: ccaAdminDetails, error: findError } = await adminClient
      .from('cca_admin_details')
      .select('user_id')
      .eq('cca_id', ccaId)
      .single();

    if (findError || !ccaAdminDetails) {
      return NextResponse.json({ success: false, error: 'No admin user found for this CCA' }, { status: 404 });
    }

    // 4. Update User Credentials
    const updateAttributes: any = {};
    if (email) updateAttributes.email = email;
    if (password) updateAttributes.password = password;

    if (Object.keys(updateAttributes).length > 0) {
      // Confirm email automatically if changed
      if (email) updateAttributes.email_confirm = true;

      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        ccaAdminDetails.user_id,
        updateAttributes
      );

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      // Sync email to public users table if changed
      if (email) {
        const { error: publicUpdateError } = await adminClient
          .from('users')
          .update({ email: email })
          .eq('id', ccaAdminDetails.user_id);

        if (publicUpdateError) {
          console.error('Failed to sync email to public users table:', publicUpdateError);
          // We don't fail the request here since auth update succeeded, but we log it
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
