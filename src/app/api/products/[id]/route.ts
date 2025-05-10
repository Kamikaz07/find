import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// GET: Fetch a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get product joined with user information including phone
    const { data, error } = await supabase
      .from('products')
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
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Include the phone number in the product response
    const productWithContact = {
      ...data,
      contact: data.users?.phone || null,
      contact_email: data.users?.email || null,
      // Remove nested users object from response
      users: undefined
    };

    return NextResponse.json({ product: productWithContact });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}