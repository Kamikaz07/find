import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching announcement:', error);
      return NextResponse.json(
        { error: 'Error fetching announcement' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Announcement not found' },
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