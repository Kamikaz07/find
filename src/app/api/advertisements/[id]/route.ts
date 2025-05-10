import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';

// GET: Fetch a single advertisement by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get advertisement joined with user information including phone
    const { data, error } = await supabase
      .from('advertisements')
      .select(`
        *,
        users:user_id (
          phone,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching advertisement:', error);
      return NextResponse.json(
        { error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    // Include the phone number in the advertisement response
    const advertisementWithContact = {
      ...data,
      contact: data.users?.phone ?? null, // Changed || to ??
      contact_email: data.users?.email ?? null, // Changed || to ??
      // Remove nested users object from response
      users: undefined
    };

    return NextResponse.json({ advertisement: advertisementWithContact });
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisement' },
      { status: 500 }
    );
  }
}

// PUT: Update an advertisement by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id
    const { title, description, location, publisher, image_url } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!title || !description || !location || !publisher) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Get the current user to verify ownership
    const session = await getAuthSession();

    // Check if session is valid and contains user with a string email
    if (
      !session ||
      typeof session !== 'object' ||
      !('user' in session) ||
      !session.user ||
      typeof session.user !== 'object' ||
      !('email' in session.user) ||
      typeof (session.user as { email?: unknown }).email !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Authentication required or user email is missing/invalid' },
        { status: 401 }
      );
    }

    // Now TypeScript knows session.user.email is a string
    const userEmail = (session.user as { email: string }).email;

    // Get user from database to get the ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the user owns the advertisement
    const { data: adData, error: adError } = await supabase
      .from('advertisements')
      .select('user_id')
      .eq('id', id)
      .single();

    if (adError || !adData) {
      console.error('Error fetching advertisement:', adError);
      return NextResponse.json(
        { error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    if (adData.user_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this advertisement' },
        { status: 403 }
      );
    }

    // Update the advertisement
    const { data, error } = await supabase
      .from('advertisements')
      .update({
        title,
        description,
        location,
        publisher,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating advertisement:', error);
      return NextResponse.json(
        { error: 'Failed to update advertisement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      advertisement: data
    });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an advertisement by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Get the current user to verify ownership
    const session = await getAuthSession();

    // Check if session is valid and contains user with a string email
    if (
      !session ||
      typeof session !== 'object' ||
      !('user' in session) ||
      !session.user ||
      typeof session.user !== 'object' ||
      !('email' in session.user) ||
      typeof (session.user as { email?: unknown }).email !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Authentication required or user email is missing/invalid' },
        { status: 401 }
      );
    }

    // Now TypeScript knows session.user.email is a string
    const userEmail = (session.user as { email: string }).email;

    // Get user from database to get the ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the user owns the advertisement
    const { data: adData, error: adError } = await supabase
      .from('advertisements')
      .select('user_id')
      .eq('id', id)
      .single();

    if (adError || !adData) {
      console.error('Error fetching advertisement:', adError);
      return NextResponse.json(
        { error: 'Advertisement not found' },
        { status: 404 }
      );
    }

    if (adData.user_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this advertisement' },
        { status: 403 }
      );
    }

    // Delete the advertisement from the database
    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting advertisement:', error);
      return NextResponse.json(
        { error: 'Failed to delete advertisement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json(
      { error: 'Failed to delete advertisement' },
      { status: 500 }
    );
  }
}