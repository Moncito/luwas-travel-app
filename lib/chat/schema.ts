// Firestore Chat Schema and Seed Logic for Admin–User Messaging

// File: lib/chat/schema.ts
export interface ChatMessage {
  sender: 'user' | 'admin';
  message: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Conversation {
  userId: string;
  adminId: string;
  lastMessage: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Firestore Structure:
// /conversations/{conversationId} → Conversation document
// /conversations/{conversationId}/messages/{messageId} → Individual chat messages
