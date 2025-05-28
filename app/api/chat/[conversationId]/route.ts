import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const messagesRef = db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    const snapshot = await messagesRef.get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
