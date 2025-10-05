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
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);

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

            {/* 🔥 Animated Dropdown */}
            <AnimatePresence>
              {bookingsOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-0 mt-2 w-44 bg-white shadow-xl rounded-md border border-blue-100 z-50 overflow-hidden"
                >
                  <motion.li
                    whileHover={{ backgroundColor: '#f0f6ff' }}
                    transition={{ duration: 0.1 }}
                  >
                    <Link
                      href="/admin/bookings"
                      className="block px-3 py-2 text-xs text-gray-700"
                      onClick={() => setBookingsOpen(false)}
                    >
                      📘 Booking List
                    </Link>
                  </motion.li>
                  <motion.li
                    whileHover={{ backgroundColor: '#f0f6ff' }}
                    transition={{ duration: 0.1 }}
                  >
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

          <NavLink href="/admin/chat-support" icon={MessageCircle} label="Chat Support" pathname={pathname} />
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
          isActive
            ? 'text-blue-700'
            : 'text-gray-600 hover:text-blue-600'
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
