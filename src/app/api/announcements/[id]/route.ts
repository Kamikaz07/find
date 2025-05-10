import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('advertisements') // Changed from 'announcements'
      .select(`
        *,
        user:user_id (
          email,
          phone_number // Added phone_number for contact info
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      console.error('Error fetching advertisement:', error);
      return NextResponse.json(
        { error: 'Error fetching advertisement' }, // Changed from 'Error fetching announcement'
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Advertisement not found' }, // Changed from 'Announcement not found'
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/announcements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}