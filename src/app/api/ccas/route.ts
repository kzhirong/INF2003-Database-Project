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
    const ids = searchParams.get('ids'); // Comma-separated list of IDs

    // OPTIMIZATION: Add pagination parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter query
    const filter: any = {};

    if (ids) {
      const idList = ids.split(',').filter(id => id.trim() !== '');
      if (idList.length > 0) {
        filter._id = { $in: idList };
      }
    }

    if (category) filter.category = category;
    if (schedule) filter.schedule = { $in: [schedule] };
    if (commitment) filter.commitment = commitment;
    if (sportType) filter.sportType = sportType;
    if (search) filter.name = { $regex: search, $options: 'i' };

    // OPTIMIZATION: Add pagination and get total count
    const [ccas, totalCount] = await Promise.all([
      CCA.find(filter)
        .select('-blocks')
        .skip(offset)
        .limit(limit)
        .lean(),
      CCA.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: ccas,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount
      }
    }, { status: 200 });
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

    console.log('Received CCA creation request:', JSON.stringify(body, null, 2));

    // Create new CCA with user as creator
    const ccaData = {
      ...body,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating CCA with data:', JSON.stringify(ccaData, null, 2));

    const cca = await CCA.create(ccaData);

    return NextResponse.json({ success: true, data: cca }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating CCA:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
