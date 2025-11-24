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
      .select('role, cca_id')
      .eq('id', user.id)
      .single();

    // Allow system_admin to edit any CCA, or cca_admin to edit their own CCA
    const isSystemAdmin = userData?.role === 'system_admin';
    const isCcaAdmin = userData?.role === 'cca_admin' && userData.cca_id === id;

    if (!userData || (!isSystemAdmin && !isCcaAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You are not authorized to edit this CCA' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Check if CCA exists
    const existingCCA = await CCA.findById(id);
    if (!existingCCA) {
      return NextResponse.json(
        { success: false, error: 'CCA not found' },
        { status: 404 }
      );
    }

    // Update CCA
    const updatedCCA = await CCA.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
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
      .select('role, cca_id')
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

    const { data: ccaAdmin } = await adminClient
      .from('users')
      .select('id, email, role, cca_id')
      .eq('cca_id', id)
      .eq('role', 'cca_admin')
      .single();

    if (ccaAdmin) {
      // Delete the user from Supabase Auth
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
        ccaAdmin.id
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
