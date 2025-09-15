"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function AdminChatPanel({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const convoRef = doc(db, "conversations", userId);
    const messagesRef = collection(db, "conversations", userId, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    const unsubMsg = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    const unsubConvo = onSnapshot(convoRef, (docSnap) => {
      setUserName(docSnap.data()?.userName || "User");
    });

    return () => {
      unsubMsg();
      unsubConvo();
    };
  }, [userId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const convoRef = doc(db, "conversations", userId);
    const messagesRef = collection(db, "conversations", userId, "messages");

    await setDoc(
      convoRef,
      {
        lastMessage: message,
        updatedAt: serverTimestamp(),
        lastMessageSender: "admin",
        adminTyping: false,
      },
      { merge: true }
    );

    await addDoc(messagesRef, {
      sender: "admin",
      text: message,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col h-[75vh] rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="font-semibold text-gray-800 text-sm">
          Chat with <span className="text-blue-600">{userName}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white to-gray-50">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-line relative ${
              msg.sender === "admin"
                ? "bg-blue-100 ml-auto text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.text}
            <div className="text-[10px] mt-1 text-gray-500">
              {msg.createdAt &&
                format(new Date(msg.createdAt.seconds * 1000), "hh:mm a")}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-2 flex items-center gap-2 bg-white">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full bg-gray-100 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
}
