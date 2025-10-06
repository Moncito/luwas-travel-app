'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MapPin,
  PlusCircle,
  BookOpen,
  CalendarCheck,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, where, query } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ping, setPing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // ✅ Unlock sound on first user interaction
  useEffect(() => {
    const enableSound = () => {
      setSoundEnabled(true);
      window.removeEventListener('click', enableSound);
    };
    window.addEventListener('click', enableSound);
    return () => window.removeEventListener('click', enableSound);
  }, []);

  // 🔔 Real-time unread listener + notification sound
  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('lastMessageSender', '==', 'user')
    );

    let firstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.size;
      setUnreadCount(count);

      // Don’t trigger sound on initial load
      if (!firstLoad && count > 0) {
        setPing(true);
        setTimeout(() => setPing(false), 1500);

        // ✅ Play sound only if allowed
        if (soundEnabled) {
          const audio = new Audio('/sounds/notification.wav');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }

        // ✅ Toast alert for admin
        toast.info(`New message received from a user 📨`, {
          duration: 3000,
        });
      }
      firstLoad = false;
    });

    return () => unsubscribe();
  }, [soundEnabled]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        {/* Logo */}
        <Link href="/admin" className="text-base font-bold text-blue-700">
          Luwas Admin
        </Link>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-5 relative">
          <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" pathname={pathname} />
          <NavLink href="/admin/users" icon={Users} label="Users" pathname={pathname} />
          <NavLink href="/admin/trips" icon={MapPin} label="Trips" pathname={pathname} />
          <NavLink href="/admin/add-destination" icon={PlusCircle} label="Destinations" pathname={pathname} />
          <NavLink href="/admin/add-promo" icon={PlusCircle} label="Promo" pathname={pathname} />
          <NavLink href="/admin/itineraries" icon={CalendarCheck} label="Itineraries" pathname={pathname} />

          {/* Bookings Dropdown */}
          <li className="relative group">
            <button
              onClick={() => setBookingsOpen(!bookingsOpen)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all',
                pathname.startsWith('/admin/bookings') || pathname === '/admin/reviews'
                  ? 'text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              )}
            >
              <BookOpen size={14} className="text-gray-400" />
              Bookings
              <ChevronDown
                size={12}
                className={`ml-1 transition-transform ${bookingsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {bookingsOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-0 mt-2 w-44 bg-white shadow-xl rounded-md border border-blue-100 z-50 overflow-hidden"
                >
                  <motion.li whileHover={{ backgroundColor: '#f0f6ff' }}>
                    <Link
                      href="/admin/bookings"
                      className="block px-3 py-2 text-xs text-gray-700"
                      onClick={() => setBookingsOpen(false)}
                    >
                      📘 Booking List
                    </Link>
                  </motion.li>
                  <motion.li whileHover={{ backgroundColor: '#f0f6ff' }}>
                    <Link
                      href="/admin/reviews"
                      className="block px-3 py-2 text-xs text-gray-700"
                      onClick={() => setBookingsOpen(false)}
                    >
                      💬 Reviews
                    </Link>
                  </motion.li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          {/* Chat Support with Notification */}
          <li className="relative group">
            <Link
              href="/admin/chat-support"
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all relative',
                pathname === '/admin/chat-support'
                  ? 'text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              )}
            >
              <MessageCircle size={14} className="text-gray-400" />
              Chat Support

              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-3 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Link>

            {ping && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute w-5 h-5 rounded-full border-2 border-blue-500 -top-0.5 -right-2"
              />
            )}
          </li>
        </ul>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold hover:bg-blue-700 transition"
          >
            A
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md border border-blue-100 z-50"
              >
                <Link
                  href="/admin/profile"
                  className="block px-3 py-2 text-xs text-gray-700 hover:bg-blue-50"
                >
                  Profile
                </Link>
                <Link
                  href="/admin/settings"
                  className="block px-3 py-2 text-xs text-gray-700 hover:bg-blue-50"
                >
                  Settings
                </Link>
                <button className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-blue-50">
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

// ───────── Helper Component ─────────
function NavLink({
  href,
  icon: Icon,
  label,
  pathname,
}: {
  href: string;
  icon: any;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <li className="relative group">
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all',
          isActive ? 'text-blue-700' : 'text-gray-600 hover:text-blue-600'
        )}
      >
        <Icon size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
        {label}
      </Link>
      <span
        className={cn(
          'absolute left-0 -bottom-0.5 h-0.5 bg-blue-600 transition-all duration-300',
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        )}
      />
    </li>
  );
}
