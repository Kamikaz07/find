import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// GET /api/announcements - Get all announcements with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get all advertisements (formerly announcements)
    let query = supabase
      .from('advertisements') // Changed from 'announcements'
      .select('*')
      .order('created_at', { ascending: false });

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: advertisements, error } = await query;

    if (error) {
      console.error('Error fetching advertisements:', error);
      return NextResponse.json(
        { error: 'Error fetching advertisements' },
        { status: 500 }
      );
    }

    // Return advertisements without user information for public viewing
    return NextResponse.json(advertisements || []);
  } catch (error) {
    console.error('Error in GET /api/announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create a new announcement
export async function POST(request: NextRequest) {
  // 1) inicializa Supabase com os cookies
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // 2) vai buscar o user ao Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }

  const userId = user.id;  // <- aqui já existe e é do tipo string

  // 3) lê o body
  const body = await request.json();

  // 4) insert into 'advertisements' (formerly 'announcements')
  const { data: advertisement, error } = await supabase // Renamed 'announcement' to 'advertisement' for clarity
    .from('advertisements') // Changed from 'announcements'
    .insert({ ...body, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json(
      { error: 'Error creating advertisement' },
      { status: 500 }
    );
  }

  return NextResponse.json(advertisement); // Renamed 'announcement' to 'advertisement'
}