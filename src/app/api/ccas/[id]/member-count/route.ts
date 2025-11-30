import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ccaId = resolvedParams.id;

    // Get authenticated user (optional - anyone can see member count)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Count enrollments for this CCA using admin client to bypass RLS
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    const { count, error } = await adminSupabase
      .from('cca_membership')
      .select('*', { count: 'exact', head: true })
      .eq('cca_id', ccaId);

    if (error) {
      console.error('Error counting members:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to count members' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count || 0
    });

  } catch (error) {
    console.error('Error in GET /api/ccas/[id]/member-count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
