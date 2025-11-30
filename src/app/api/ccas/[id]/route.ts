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

    // Only system_admin can delete CCAs
    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only system admins can delete CCAs' },
        { status: 403 }
      );
    }

    await connectDB();

    // 1. Fetch CCA Details (to get image URLs)
    const existingCCA = await CCA.findById(id);
    if (!existingCCA) {
      return NextResponse.json(
        { success: false, error: 'CCA not found' },
        { status: 404 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Fetch & Delete Events
    // Get all events for this CCA
    const { data: events } = await adminClient
      .from('events')
      .select('id, poster_url')
      .eq('cca_id', id);

    const eventIds = events?.map(e => e.id) || [];
    const posterUrls = events?.map(e => e.poster_url).filter(Boolean) || [];

    if (eventIds.length > 0) {
      // Delete attendance for these events
      await adminClient
        .from('attendance')
        .delete()
        .in('event_id', eventIds);

      // Delete the events themselves
      await adminClient
        .from('events')
        .delete()
        .in('id', eventIds);
    }

    // 3. Fetch & Delete Sessions
    // Get all sessions for this CCA
    const { data: sessions } = await adminClient
      .from('sessions')
      .select('id')
      .eq('cca_id', id);

    const sessionIds = sessions?.map(s => s.id) || [];

    if (sessionIds.length > 0) {
      // Delete attendance for these sessions
      await adminClient
        .from('attendance')
        .delete()
        .in('session_id', sessionIds);

      // Delete the sessions themselves
      await adminClient
        .from('sessions')
        .delete()
        .in('id', sessionIds);
    }

    // 4. Delete Memberships
    await adminClient
      .from('cca_membership')
      .delete()
      .eq('cca_id', id);

    // 5. Delete CCA Admin
    // Find the CCA admin in cca_admin_details table
    const { data: ccaAdminDetails } = await adminClient
      .from('cca_admin_details')
      .select('user_id')
      .eq('cca_id', id)
      .single();

    if (ccaAdminDetails) {
      // Delete from cca_admin_details
      await adminClient
        .from('cca_admin_details')
        .delete()
        .eq('cca_id', id);

      // Delete from public users table
      await adminClient
        .from('users')
        .delete()
        .eq('id', ccaAdminDetails.user_id);

      // Delete from Supabase Auth
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
        ccaAdminDetails.user_id
      );

      if (deleteAuthError) {
        console.error('Error deleting CCA admin from Auth:', deleteAuthError);
        // Continue anyway to ensure other data is cleaned up
      }
    }

    // 6. Delete Storage Files
    const filesToDelete: { bucket: string; path: string }[] = [];

    // Helper to extract bucket and path from URL
    const extractFileDetails = (url: string) => {
      try {
        // Assuming URL format: .../storage/v1/object/public/[bucket]/[path]
        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          const parts = urlObj.pathname.split('/public/');
          if (parts.length > 1) {
            const fullPath = parts[1];
            const pathParts = fullPath.split('/');
            const bucket = pathParts[0];
            const path = pathParts.slice(1).join('/');
            return { bucket, path };
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    if (existingCCA.profileImage) {
      const details = extractFileDetails(existingCCA.profileImage);
      if (details) filesToDelete.push(details);
    }

    if (existingCCA.heroImage) {
      const details = extractFileDetails(existingCCA.heroImage);
      if (details) filesToDelete.push(details);
    }

    posterUrls.forEach((url: string) => {
      const details = extractFileDetails(url);
      if (details) filesToDelete.push(details);
    });

    if (filesToDelete.length > 0) {
      // Group files by bucket
      const filesByBucket = filesToDelete.reduce((acc, file) => {
        if (!acc[file.bucket]) {
          acc[file.bucket] = [];
        }
        acc[file.bucket].push(file.path);
        return acc;
      }, {} as Record<string, string[]>);

      // Delete from each bucket
      for (const [bucket, paths] of Object.entries(filesByBucket)) {
        const { error: storageError } = await adminClient
          .storage
          .from(bucket)
          .remove(paths);
        
        if (storageError) {
          console.error(`Error deleting files from bucket ${bucket}:`, storageError);
        }
      }
    }

    // 7. Delete CCA from MongoDB
    await CCA.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'CCA and all associated data deleted successfully' },
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
