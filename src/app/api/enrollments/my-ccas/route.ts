import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dbConnect from '@/lib/mongoose';
import CCA from '@/models/CCA';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Query enrollments for this user
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('cca_membership')
      .select('id, cca_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    // If no enrollments, return empty array
    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Connect to MongoDB and fetch CCA details
    await dbConnect();

    const ccaIds = enrollments.map(e => e.cca_id);
    const ccas = await CCA.find({ _id: { $in: ccaIds } }).lean();

    // Create a map for quick CCA lookup
    const ccaMap = new Map(ccas.map(cca => [cca._id.toString(), cca]));

    // Merge enrollment data with CCA data
    const result = enrollments.map(enrollment => ({
      id: enrollment.id,
      cca_id: enrollment.cca_id,
      created_at: enrollment.created_at,
      cca: ccaMap.get(enrollment.cca_id) || null
    }));

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in GET /api/enrollments/my-ccas:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
