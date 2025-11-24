import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

// GET all CCAs (with optional filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const schedule = searchParams.get('schedule');
    const commitment = searchParams.get('commitment');
    const sportType = searchParams.get('sportType');
    const search = searchParams.get('search');

    // Build filter query
    const filter: any = {};

    if (category) filter.category = category;
    if (schedule) filter.schedule = { $in: [schedule] };
    if (commitment) filter.commitment = commitment;
    if (sportType) filter.sportType = sportType;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const ccas = await CCA.find(filter).select('-blocks').lean();

    return NextResponse.json({ success: true, data: ccas }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching CCAs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new CCA
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is system admin (only admins can create CCAs)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'system_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only system admins can create CCAs' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Create new CCA with user as creator
    const cca = await CCA.create({
      ...body,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, data: cca }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCA:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
