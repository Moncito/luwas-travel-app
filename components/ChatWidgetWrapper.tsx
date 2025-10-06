'use client';

import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useEffect, useState } from 'react';
import UserChatWidget from './UserChatWidget';

export default function ChatWidgetWrapper() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAdmin = pathname.startsWith('/admin');

  // ✅ Hide widget if user not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Don’t show in admin or unauthenticated mode
  if (isAdmin || !isAuthenticated) return null;

  return <UserChatWidget />;
}
