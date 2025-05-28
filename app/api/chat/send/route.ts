import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, adminId, message, sender } = await req.json();

    if (!userId || !adminId || !message || !sender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conversationId = `${userId}_${adminId}`;
    const timestamp = new Date();

    const conversationRef = db.collection('conversations').doc(conversationId);
    const messageRef = conversationRef.collection('messages').doc();

    const chatMessage = {
      sender, // 'user' or 'admin'
      message,
      createdAt: timestamp,
    };

    const conversationData = {
      userId,
      adminId,
      lastMessage: message,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Create or update conversation doc
    await conversationRef.set(conversationData, { merge: true });
    await messageRef.set(chatMessage);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
