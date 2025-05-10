import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';

// GET: Fetch all public advertisements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const currentDate = new Date().toISOString();

    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_public', true)
      // Filter out expired advertisements
      .or(`expiration_date.is.null,expiration_date.gt.${currentDate}`)
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,publisher.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ advertisements: data });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    );
  }
}

// POST: Create a new advertisement
export async function POST(request: NextRequest) {
  try {
    const { title, description, location, publisher, image_url, expiration_date } = await request.json();

    // Validate inputs
    if (!title || !description || !location || !publisher) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current user from NextAuth
    const session = await getAuthSession() as { user?: { email: string } };

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

    // Create the advertisement
    const { data, error } = await supabase
      .from('advertisements')
      .insert([
        {
          user_id: userData.id,
          title,
          description,
          location,
          publisher,
          image_url,
          expiration_date,
          is_public: true
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      advertisement: data
    });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to create advertisement' },
      { status: 500 }
    );
  }
}
