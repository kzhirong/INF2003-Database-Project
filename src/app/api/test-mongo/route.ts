import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: 'MongoDB connected successfully!',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Check your MONGODB_URI in .env.local'
    }, { status: 500 });
  }
}
