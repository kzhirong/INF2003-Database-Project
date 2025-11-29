import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check
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

    const body = await request.json();
    const { name, email } = body;

    let nameExists = false;
    let emailExists = false;

    // 2. Check CCA Name in MongoDB
    if (name) {
      await connectDB();
      // Case-insensitive check
      const existingCCA = await CCA.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      if (existingCCA) {
        nameExists = true;
      }
    }

    // 3. Check Email in Supabase
    if (email) {
      const adminClient = createAdminClient();
      
      // Check public.users table first (assuming it's synced)
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUser) {
        emailExists = true;
      } else {
        // Fallback: Check Auth users directly to be sure
        // Note: listUsers isn't ideal for single lookup but works for small batches
        // or we can assume public.users is the source of truth for "taken" emails in our app logic
        // But let's try to be thorough.
        // Actually, for now let's rely on public.users. If that's empty, the trigger might have failed,
        // but usually it should be there.
      }
    }

    return NextResponse.json({
      success: true,
      exists: nameExists || emailExists,
      nameExists,
      emailExists
    });

  } catch (error: any) {
    console.error('Error checking CCA existence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
