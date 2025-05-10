import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';

// GET: Fetch all advertisements for the current user
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current user from NextAuth
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database to get the ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's advertisements
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ advertisements: data });
  } catch (error) {
    console.error('Error fetching user advertisements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}
