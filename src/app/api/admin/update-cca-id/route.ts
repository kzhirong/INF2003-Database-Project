import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Update a user's CCA ID
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is system admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only system admins can update CCA IDs' },
        { status: 403 }
      );
    }

    const { email, cca_id } = await request.json();

    if (!email || !cca_id) {
      return NextResponse.json(
        { success: false, error: 'Email and CCA ID are required' },
        { status: 400 }
      );
    }

    // Update the user's CCA ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ cca_id })
      .eq('email', email);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Updated CCA ID for ${email} to ${cca_id}`
    });
  } catch (error: any) {
    console.error('Error updating CCA ID:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
