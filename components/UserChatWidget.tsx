'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useAuth } from '@/lib/useAuth';
import { MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';

// ✅ Define message type
interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function UserChatWidget() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const convoId = user.uid;
    const messagesRef = collection(db, 'conversations', convoId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(docs);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    const typingRef = doc(db, 'conversations', convoId);
    const unsubscribeTyping = onSnapshot(typingRef, (docSnap) => {
      setAdminTyping(docSnap.data()?.adminTyping || false);
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [user?.uid]);

  const sendMessage = async () => {
    if (!message.trim() || !user?.uid) return;

    const convoId = user.uid;
    const convoRef = doc(db, 'conversations', convoId);
    const messagesRef = collection(db, 'conversations', convoId, 'messages');

    await setDoc(
      convoRef,
      {
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        lastMessage: message,
        updatedAt: serverTimestamp(),
        lastMessageSender: 'user',
        userTyping: false,
      },
      { merge: true }
    );

    await addDoc(messagesRef, {
      sender: 'user',
      text: message,
      createdAt: serverTimestamp(),
    });

    setMessage('');
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user?.uid) return;
      const convoRef = doc(db, 'conversations', user.uid);
      setDoc(convoRef, { userTyping: !!message }, { merge: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [message, user?.uid]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold tracking-wide">💬 Chat with Us</span>
            <X
              onClick={() => setIsOpen(false)}
              className="w-5 h-5 hover:text-gray-200 cursor-pointer"
            />
          </div>

          <div className="h-64 p-3 space-y-2 overflow-y-auto bg-gradient-to-b from-gray-50 to-white text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] rounded-lg p-2 shadow-sm break-words ${
                  msg.sender === 'user'
                    ? 'bg-blue-100 ml-auto text-right'
                    : 'bg-gray-100 text-left'
                }`}
              >
                <p>{msg.text}</p>
                {msg.createdAt && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {format(new Date(msg.createdAt.seconds * 1000), 'hh:mm a')}
                  </p>
                )}
              </div>
            ))}
            {adminTyping && (
              <div className="text-xs text-gray-500 italic">
                Admin is typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t bg-white px-3 py-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-md shadow"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
