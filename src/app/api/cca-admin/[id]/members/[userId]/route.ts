import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.id;
    const userId = resolvedParams.userId;

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

    // Check if enrollment exists
    const { data: enrollment, error: findError } = await supabase
      .from('cca_membership')
      .select('id')
      .eq('user_id', userId)
      .eq('cca_id', ccaId)
      .maybeSingle();

    if (findError) {
      console.error('Error finding enrollment:', findError);
      return NextResponse.json(
        { success: false, error: 'Failed to find enrollment' },
        { status: 500 }
      );
    }

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Student is not enrolled in this CCA' },
        { status: 404 }
      );
    }

    // Hard delete the enrollment
    const { error: deleteError } = await supabase
      .from('cca_membership')
      .delete()
      .eq('user_id', userId)
      .eq('cca_id', ccaId);

    if (deleteError) {
      console.error('Error deleting enrollment:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/cca-admin/[id]/members/[userId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
