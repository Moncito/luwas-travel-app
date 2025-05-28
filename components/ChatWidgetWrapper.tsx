'use client';

import { usePathname } from 'next/navigation';
import UserChatWidget from './UserChatWidget';

export default function ChatWidgetWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return <UserChatWidget />;
}
