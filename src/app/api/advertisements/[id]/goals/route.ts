import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import { AuthSession } from '@supabase/supabase-js';

// GET: Fetch goals for a specific advertisement
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated to use Promise
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id; // No need to cast since type is specified
    
    if (!id) {
      return NextResponse.json(
        { error: 'Advertisement ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('advertisement_goals')
      .select('*')
      .eq('advertisement_id', id);

    if (error) {
      console.error('Error fetching advertisement goals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advertisement goals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ goals: data });
  } catch (error) {
    console.error('Error fetching advertisement goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisement goals' },
      { status: 500 }
    );
  }
}

// POST: Create a new goal for an advertisement
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated to use Promise
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id; // No need to cast since type is specified
    const { goal_type, target_amount } = await request.json();

    // Validate inputs
    if (!id || !goal_type || !target_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate target_amount is a number
    const targetAmount = parseFloat(target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be a positive number' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current user from NextAuth
    const session = await getAuthSession() as AuthSession;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Add check for session.user.email
    if (!session.user.email) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 401 }
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

    // Check if the user owns the advertisement
    if (adData.user_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to add goals to this advertisement' },
        { status: 403 }
      );
    }

    // Create the goal
    const { data, error } = await supabase
      .from('advertisement_goals')
      .insert([
        {
          advertisement_id: id,
          goal_type,
          target_amount: targetAmount,
          current_amount: 0
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      goal: data
    });
  } catch (error) {
    console.error('Error creating advertisement goal:', error);
    return NextResponse.json(
      { error: 'Failed to create advertisement goal' },
      { status: 500 }
    );
  }
}

// PATCH: Update the current amount of a goal
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated to use Promise
) {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id; // No need to cast since type is specified
    const { goal_id, amount } = await request.json();

    // Validate inputs
    if (!id || !goal_id || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount is a number
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get the current goal
    const { data: goalData, error: goalError } = await supabase
      .from('advertisement_goals')
      .select('current_amount')
      .eq('id', goal_id)
      .eq('advertisement_id', id)
      .single();

    if (goalError || !goalData) {
      console.error('Error fetching goal:', goalError);
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update the goal
    const newAmount = goalData.current_amount + amountValue;
    const { data, error } = await supabase
      .from('advertisement_goals')
      .update({ current_amount: newAmount })
      .eq('id', goal_id)
      .eq('advertisement_id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      goal: data
    });
  } catch (error) {
    console.error('Error updating advertisement goal:', error);
    return NextResponse.json(
      { error: 'Failed to update advertisement goal' },
      { status: 500 }
    );
  }
}