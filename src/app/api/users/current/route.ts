import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';

// GET: Fetch current user's data
export async function GET() {
  try {
    // Get authenticated user
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Fetch user data from database
    const { data, error } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('email', session.user.email)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do utilizador' },
      { status: 500 }
    );
  }
}

// PUT: Update user's profile information
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória' },
        { status: 401 }
      );
    }

    const { name, phone } = await request.json();

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Update user in database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        phone
      })
      .eq('email', session.user.email)
      .select('id, email, phone')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: data 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}