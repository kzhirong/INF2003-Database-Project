import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, course_name')
      .order('course_name', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
