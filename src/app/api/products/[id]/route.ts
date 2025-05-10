import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import { AuthSession } from '@supabase/supabase-js';

// GET: Fetch a single product by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('products')
      .select('*') // You might want to join user data if needed: users:user_id (email, phone)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if product is public or if the user is authenticated (for fetching non-public items for owner)
    // For simplicity here, we assume if it's fetched by ID directly, it's okay, or add specific logic.
    // If you need to check if the product is_public OR if the requester is the owner:
    // const session = await getAuthSession();
    // if (!data.is_public && data.user_id !== session?.user?.id) {
    //   return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 });
    // }


    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product by ID
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id
    const { title, description, price, location, publisher, image_url, category, is_public } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!title || !description || price === undefined || !location || !publisher || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const session = await getAuthSession() as AuthSession;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required or user email is missing' },
        { status: 401 }
      );
    }

    // Get user from database to get their ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data for product update:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the user owns the product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single();

    if (productError || !productData) {
      console.error('Error fetching product for ownership check:', productError);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (productData.user_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this product' },
        { status: 403 }
      );
    }

    // Define interface for product update payload
    interface ProductUpdatePayload {
      title: string;
      description: string;
      price: number;
      location: string;
      publisher: string;
      category: string;
      updated_at: string;
      image_url?: string | null;
      is_public?: boolean;
    }

    // Update the product
    const updatePayload: ProductUpdatePayload = {
      title,
      description,
      price: priceValue,
      location,
      publisher,
      category,
      updated_at: new Date().toISOString(),
    };

    if (image_url !== undefined) { // Only update image_url if provided
        updatePayload.image_url = image_url;
    }
    if (is_public !== undefined) {
        updatePayload.is_public = is_public;
    }


    const { data, error: updateError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
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

// DELETE: Remove a product by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const resolvedParams = await context.params; // Added await
    const id = resolvedParams.id; // Use resolved id
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const session = await getAuthSession() as AuthSession;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required or user email is missing' },
        { status: 401 }
      );
    }

    // Get user from database to get their ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data for product delete:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the user owns the product
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', id)
      .single();

    if (productError || !productData) {
      console.error('Error fetching product for ownership check (delete):', productError);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (productData.user_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this product' },
        { status: 403 }
      );
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}