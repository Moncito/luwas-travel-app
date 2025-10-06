"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebase/client";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminChatNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [ping, setPing] = useState(false);
  const soundPlayed = useRef(false);

  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      where("lastMessageSender", "==", "user")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);

      if (snapshot.size > 0 && !soundPlayed.current) {
        const audio = new Audio("/sounds/notification.wav");
        audio.volume = 0.5;
        audio.play().catch(() => {});
        soundPlayed.current = true;
        setPing(true);
        setTimeout(() => setPing(false), 2000);
      } else if (snapshot.size === 0) {
        soundPlayed.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center"
    >
      <button
        onClick={() => (window.location.href = "/admin/chat-support")}
        className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden md:inline">Chat Support</span>

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 shadow"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {ping && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute w-6 h-6 rounded-full border-2 border-blue-400 opacity-70 -top-1 -right-2"
        />
      )}
    </motion.div>
  );
}
