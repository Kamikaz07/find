import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

// GET /api/announcements - Get all announcements with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const location = searchParams.get('location');

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get all announcements
    let query = supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json(
        { error: 'Error fetching announcements' },
        { status: 500 }
      );
    }

    // Return announcements without user information for public viewing
    return NextResponse.json(announcements || []);
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

  // 4) insert com user_id
  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({ ...body, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json(
      { error: 'Error creating announcement' },
      { status: 500 }
    );
  }

  return NextResponse.json(announcement);
}