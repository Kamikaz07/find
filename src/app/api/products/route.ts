import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import { AuthSession } from '@supabase/supabase-js';

// GET: Fetch all public products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,publisher.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request: NextRequest) {
  try {
    const { title, description, price, location, publisher, image_url, category, is_public } = await request.json(); // Added is_public

    // Validate inputs
    if (!title || !description || !price || !location || !publisher || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price is a number
    if (isNaN(parseFloat(price))) {
      return NextResponse.json(
        { error: 'Price must be a number' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current user from NextAuth
    const session: AuthSession | null = await getAuthSession() as AuthSession | null;

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

    // Create the product
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          user_id: userData.id,
          title,
          description,
          price,
          location,
          publisher,
          image_url,
          category,
          is_public: is_public === undefined ? true : is_public, // Default to true if not provided
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      product: data
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const { title, description, price, location, publisher, image_url, category, is_public } = await request.json(); // Added is_public

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!title || !description || !price || !location || !publisher || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price is a number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      return NextResponse.json(
        { error: 'Price must be a number' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current user from NextAuth
    const session: AuthSession | null = await getAuthSession() as AuthSession | null;

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

    // Define a type for product update data
    interface ProductUpdateData {
      title: string;
      description: string;
      price: number;
      location: string;
      publisher: string;
      image_url?: string | null;
      category: string;
      updated_at: string;
      is_public?: boolean;
    }

    // Update the product
    const updateData: ProductUpdateData = {
      title,
      description,
      price: priceValue,
      location,
      publisher,
      image_url,
      category,
      updated_at: new Date().toISOString(),
    };

    if (is_public !== undefined) {
      updateData.is_public = is_public;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      product: data
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}