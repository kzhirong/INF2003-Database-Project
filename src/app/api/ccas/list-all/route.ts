import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

// GET all CCAs with their IDs (for debugging)
export async function GET() {
  try {
    await connectDB();

    const ccas = await CCA.find({}).select('_id name category').lean();

    return NextResponse.json({
      success: true,
      ccas: ccas.map(cca => ({
        id: cca._id.toString(),
        name: cca.name,
        category: cca.category
      }))
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching CCAs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
