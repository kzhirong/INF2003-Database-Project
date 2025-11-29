import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

// GET single CCA by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const cca = await CCA.findById(id).lean();

    if (!cca) {
      return NextResponse.json(
        { success: false, error: 'CCA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cca }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching CCA:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update CCA
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role and permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Allow system_admin to edit any CCA
    const isSystemAdmin = userData.role === 'system_admin';

    // For CCA admins, check if they own this CCA
    let isCcaAdmin = false;
    if (userData.role === 'cca_admin') {
      const { data: adminData } = await supabase
        .from('cca_admin_details')
        .select('cca_id')
        .eq('user_id', user.id)
        .single();

      isCcaAdmin = adminData?.cca_id === id;
    }

    if (!isSystemAdmin && !isCcaAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You are not authorized to edit this CCA' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Server-side protection: Prevent CCA admins from modifying structural fields
    if (userData.role === 'cca_admin') {
      delete body.name;
      delete body.category;
      delete body.sportType;
      // commitment and schedule are now allowed
    }

    // Check if CCA exists
    const existingCCA = await CCA.findById(id);
    if (!existingCCA) {
      return NextResponse.json(
        { success: false, error: 'CCA not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      updatedAt: new Date()
    };

    // Prepare fields to unset
    const unsetFields: any = {};

    // If schedule is null, remove it from the document (unset it)
    if (body.schedule === null) {
      delete updateData.schedule;
      unsetFields.schedule = 1;
    }

    // If sportType is null, remove it from the document (unset it)
    if (body.sportType === null) {
      delete updateData.sportType;
      unsetFields.sportType = 1;
    }

    // Apply unset operation if there are fields to unset
    if (Object.keys(unsetFields).length > 0) {
      await CCA.findByIdAndUpdate(id, { $unset: unsetFields });
    }

    // Update CCA
    const updatedCCA = await CCA.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedCCA }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating CCA:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete CCA
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check user role and permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Only system_admin can delete CCAs (prevent CCA admins from deleting their own CCAs)
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only system admins can delete CCAs' },
        { status: 403 }
      );
    }

    await connectDB();

    // Check if CCA exists
    const existingCCA = await CCA.findById(id);
    if (!existingCCA) {
      return NextResponse.json(
        { success: false, error: 'CCA not found' },
        { status: 404 }
      );
    }

    // Find and delete the CCA admin user from Supabase
    // Use admin client to bypass RLS and find the user
    const adminClient = createAdminClient();

    // First, find the CCA admin in cca_admin_details table
    const { data: ccaAdminDetails } = await adminClient
      .from('cca_admin_details')
      .select('user_id')
      .eq('cca_id', id)
      .single();

    if (ccaAdminDetails) {
      // Explicitly delete from public users table first to ensure it's removed
      const { error: deletePublicError } = await adminClient
        .from('users')
        .delete()
        .eq('id', ccaAdminDetails.user_id);

      if (deletePublicError) {
        console.error('Error deleting from public users table:', deletePublicError);
        // We continue to delete from Auth even if this fails, to ensure access is revoked
      }

      // Delete the user from Supabase Auth
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
        ccaAdminDetails.user_id
      );

      if (deleteAuthError) {
        console.error('Error deleting CCA admin from Auth:', deleteAuthError);
        return NextResponse.json(
          { success: false, error: `Failed to delete CCA admin account: ${deleteAuthError.message}` },
          { status: 500 }
        );
      }
    }

    // Delete the CCA from MongoDB
    await CCA.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'CCA and associated admin account deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting CCA:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
