import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{9,}$/;

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, password, receiveUpdates } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Por favor, insira um endereço de email válido' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'A password não cumpre os requisitos mínimos' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    console.log('Attempting to create user with email:', email);

    // Use Supabase Auth to create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          receive_updates: !!receiveUpdates
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);

      // Handle rate limiting error
      if (authError.status === 429) {
        return NextResponse.json(
          { error: 'Por favor, aguarde alguns segundos antes de tentar novamente.' },
          { status: 429 }
        );
      }

      // Handle email already registered
      if (authError.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está registado' },
          { status: 409 }
        );
      }

      // Handle invalid email
      if (authError.code === 'email_address_invalid') {
        return NextResponse.json(
          { error: 'Por favor, insira um endereço de email válido' },
          { status: 400 }
        );
      }

      // Handle other auth errors
      return NextResponse.json(
        { error: `Erro ao criar conta: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error('No user data returned from Supabase');
      return NextResponse.json(
        { error: 'Erro ao criar conta. Por favor, tente novamente.' },
        { status: 500 }
      );
    }

    console.log('User created successfully:', authData.user.id);

    return NextResponse.json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ocorreu um erro ao registar' },
      { status: 500 }
    );
  }
} 