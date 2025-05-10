import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getAuthSession } from '@/lib/auth';
import { AuthSession } from '@supabase/supabase-js';

// GET: Fetch user's messages conversations
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getAuthSession() as { user?: { email: string } };

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Get the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }
    
    const userId = userData.id;
    
    // Get the URL params
    const url = new URL(request.url);
    const contactId = url.searchParams.get('contactId');
    
    // If contactId is provided, fetch messages with that user
    if (contactId) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          message,
          read,
          created_at,
          advertisement_id,
          product_id,
          advertisements:advertisement_id (
            title
          ),
          products:product_id (
            title
          ),
          sender:sender_id (
            email,
            phone
          ),
          receiver:receiver_id (
            email,
            phone
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return NextResponse.json(
          { error: 'Erro ao buscar mensagens' },
          { status: 500 }
        );
      }

      // Mark messages as read if user is the receiver
      const unreadMessages = messages?.filter(m => !m.read && m.receiver_id === userId) || [];
      
      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadMessages.map(m => m.id));
          
        if (updateError) {
          console.error('Error updating message read status:', updateError);
        }
      }

      return NextResponse.json({ messages });
    }

    // Otherwise, fetch conversation summaries
    // First, get all unique contacts
    const { data: sentToContacts, error: sentError } = await supabase
      .from('chat_messages')
      .select('receiver_id')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    const { data: receivedFromContacts, error: receivedError } = await supabase
      .from('chat_messages')
      .select('sender_id')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });
      
    if (sentError || receivedError) {
      console.error('Error fetching contacts:', sentError || receivedError);
      return NextResponse.json(
        { error: 'Erro ao buscar contactos' },
        { status: 500 }
      );
    }
    
    // Combine and deduplicate contacts
    const sentContactIds = sentToContacts?.map(contact => contact.receiver_id) || [];
    const receivedContactIds = receivedFromContacts?.map(contact => contact.sender_id) || [];
    const allContactIds = [...new Set([...sentContactIds, ...receivedContactIds])];
    
    if (allContactIds.length === 0) {
      return NextResponse.json({ conversations: [] });
    }
    
    // Fetch latest messages for each contact
    const conversations = [];
    
    for (const contactId of allContactIds) {
      const { data: latestMessage, error: latestError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          message,
          read,
          created_at,
          advertisement_id,
          product_id,
          advertisements:advertisement_id (
            title
          ),
          products:product_id (
            title
          ),
          sender:sender_id (
            email,
            phone
          ),
          receiver:receiver_id (
            email,
            phone
          )
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestError && latestMessage) {
        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', contactId)
          .eq('receiver_id', userId)
          .eq('read', false);
          
        conversations.push({
          contact: latestMessage.sender_id === userId ? latestMessage.receiver : latestMessage.sender,
          contactId: latestMessage.sender_id === userId ? latestMessage.receiver_id : latestMessage.sender_id,
          latestMessage: latestMessage,
          unreadCount: unreadCount || 0
        });
      }
    }
    
    // Sort conversations by latest message
    conversations.sort((a, b) => 
      new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime()
    );
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getAuthSession() as AuthSession;

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória' },
        { status: 401 }
      );
    }

    const { receiverId, message, advertisementId, productId } = await request.json();

    // Validate inputs
    if (!receiverId || !message) {
      return NextResponse.json(
        { error: 'Destinatário e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Get the sender's user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }
    
    const senderId = userData.id;
    
    // Verify receiver exists
    const { data: receiverData, error: receiverError } = await supabase
      .from('users')
      .select('id')
      .eq('id', receiverId)
      .single();
      
    if (receiverError || !receiverData) {
      console.error('Error verifying receiver:', receiverError);
      return NextResponse.json(
        { error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }
    
    // Insert new message using service role bypass for RLS
    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      advertisement_id: advertisementId || null,
      product_id: productId || null,
      message,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Sending message data:', messageData);
    
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single();

    if (insertError) {
      console.error('Error sending message:', insertError);
      return NextResponse.json(
        { error: `Erro ao enviar mensagem: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: `Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}