import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcrypt';

// PUT: Change user's password
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

    const { currentPassword, newPassword } = await request.json();

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password atual e nova password são obrigatórias' },
        { status: 400 }
      );
    }

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{9,}$/;

    // Validate password strength
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: 'A nova password não cumpre os requisitos mínimos' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the user's current password from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Verify the current password
    const passwordValid = await bcrypt.compare(
      currentPassword, 
      userData.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Password atual incorreta' },
        { status: 403 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password atualizada com sucesso' 
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar password' },
      { status: 500 }
    );
  }
}