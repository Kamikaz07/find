import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth';

// GET /api/marketplace - Get all marketplace items with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const location = searchParams.get('location');

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    let query = supabase
      .from('marketplace_items')
      .select('*, users(email)');

    if (type) {
      query = query.eq('type', type);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar itens do mercado' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace - Create a new marketplace item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(auth);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { title, description, price, location, type, image_url } = await request.json();

    if (!title || !description || !price || !location || !type) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('marketplace_items')
      .insert([
        {
          user_id: session.user.id,
          title,
          description,
          price,
          location,
          type,
          image_url
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating marketplace item:', error);
    return NextResponse.json(
      { error: 'Erro ao criar item do mercado' },
      { status: 500 }
    );
  }
} 