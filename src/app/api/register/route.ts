import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{9,}$/;

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

    // Validate password strength
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'A password não cumpre os requisitos mínimos' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw checkError;
    }

    if (existingUser) {
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
          phone,
          receive_updates: !!receiveUpdates
        }
      ])
      .select('id, email, phone')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, phone: newUser.phone },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro ao registar' },
      { status: 500 }
    );
  }
}