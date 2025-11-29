import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongoose";
import CCA from "@/models/CCA";

// GET /api/memberships - List memberships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cca_id = searchParams.get("cca_id");
    const user_id = searchParams.get("user_id");

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("cca_membership")
      .select("id, cca_id, user_id, created_at")
      .order("created_at", { ascending: false });

    if (cca_id) {
      query = query.eq("cca_id", cca_id);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: memberships, error } = await query;

    if (error) throw error;

    // Enrich with CCA names from MongoDB and user data
    await connectDB();
    const enrichedMemberships = await Promise.all(
      (memberships || []).map(async (membership: any) => {
        const cca = await CCA.findById(membership.cca_id).lean();

        // Fetch user data from auth.users via admin client
        const { data: userData } = await supabase.auth.admin.getUserById(
          membership.user_id
        );

        return {
          id: membership.id,
          cca_id: membership.cca_id,
          cca_name: cca?.name || "Unknown CCA",
          user_id: membership.user_id,
          created_at: membership.created_at,
          student: userData?.user
            ? {
                id: userData.user.id,
                name: userData.user.user_metadata?.name || "Unknown",
                student_id: userData.user.user_metadata?.student_id || "N/A",
                email: userData.user.email || "",
                phone_number: userData.user.user_metadata?.phone_number || null,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedMemberships,
    });
  } catch (error: any) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/memberships - Add member to CCA
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is CCA admin
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Only CCA admins can add members",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { cca_id, user_id } = body;

    // Verify admin is adding member to their own CCA
    if (cca_id !== adminData.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - You can only add members to your CCA",
        },
        { status: 403 }
      );
    }

    // Check if membership already exists
    const { data: existingMembership } = await supabase
      .from("cca_membership")
      .select("id")
      .eq("cca_id", cca_id)
      .eq("user_id", user_id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        {
          success: false,
          error: "Student is already a member of this CCA",
        },
        { status: 400 }
      );
    }

    // Create membership
    const { data: membership, error } = await supabase
      .from("cca_membership")
      .insert({
        cca_id,
        user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: membership },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding membership:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/memberships - Remove member from CCA
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const membership_id = searchParams.get("id");

    if (!membership_id) {
      return NextResponse.json(
        { success: false, error: "Missing membership ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get membership to check ownership
    const { data: membership } = await supabase
      .from("cca_membership")
      .select("cca_id")
      .eq("id", membership_id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Membership not found" },
        { status: 404 }
      );
    }

    // Check if user is admin of this CCA
    const { data: adminData } = await supabase
      .from("cca_admin_details")
      .select("cca_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData || adminData.cca_id !== membership.cca_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - You can only remove members from your CCA",
        },
        { status: 403 }
      );
    }

    // Delete membership
    const { error } = await supabase
      .from("cca_membership")
      .delete()
      .eq("id", membership_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Membership removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing membership:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
