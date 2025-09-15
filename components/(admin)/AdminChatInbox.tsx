"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { formatDistanceToNow } from "date-fns";

interface Props {
  onSelectUser: (id: string) => void;
  activeUserId?: string;
}

interface Conversation {
  id: string;
  userId: string;
  lastMessage: string;
  updatedAt: { seconds: number };
  unread?: boolean;
  userName?: string;
}

export default function AdminChatInbox({ onSelectUser, activeUserId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos: Conversation[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let userName = "User";

          try {
            const userDoc = await getDoc(doc(db, "users", data.userId));
            if (userDoc.exists()) {
              userName = userDoc.data().fullName || userName;
            }
          } catch (err) {
            console.warn("⚠️ Failed to fetch user profile:", err);
          }

          return {
            id: docSnap.id,
            userId: data.userId,
            lastMessage: data.lastMessage || "",
            updatedAt: data.updatedAt || { seconds: 0 },
            unread: data.lastMessageSender === "user",
            userName,
          };
        })
      );
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = async (convo: Conversation) => {
    onSelectUser(convo.userId);

    await updateDoc(doc(db, "conversations", convo.id), {
      lastMessageSender: "admin",
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md col-span-1 border border-gray-100 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
        📥 Admin Inbox
      </h2>

      {/* Search Bar */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className="mb-4 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      {conversations.length === 0 ? (
        <p className="text-gray-400 italic">No conversations yet.</p>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[70vh]">
          {conversations
            .filter((c) =>
              c.userName?.toLowerCase().includes(search.toLowerCase())
            )
            .map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                className={`p-4 rounded-lg cursor-pointer transition-all border flex justify-between items-start
                  ${activeUserId === c.userId ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-blue-800 text-sm">{c.userName}</span>
                  <span className="text-xs text-gray-500 line-clamp-1">{c.lastMessage}</span>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                  {c.unread && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                  <span>
                    {c.updatedAt?.seconds
                      ? formatDistanceToNow(new Date(c.updatedAt.seconds * 1000), { addSuffix: true })
                      : ""}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
