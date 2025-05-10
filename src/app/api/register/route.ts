import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{9,}$/;

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone, receiveUpdates } = await request.json();

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          receive_updates: !!receiveUpdates
        }
      ])
      .select('id, email')
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('User created successfully:', authData.user.id);

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ocorreu um erro ao registar' },
      { status: 500 }
    );
  }
}