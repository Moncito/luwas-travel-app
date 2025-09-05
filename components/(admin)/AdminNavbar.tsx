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
} from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Trips', href: '/admin/trips', icon: MapPin },
  { label: 'Destinations', href: '/admin/add-destination', icon: PlusCircle },
  { label: 'Itineraries', href: '/admin/itineraries', icon: CalendarCheck },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Chat Support', href: '/admin/chat-support', icon: MessageCircle },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        {/* Logo */}
        <Link href="/admin" className="text-base font-bold text-blue-700">
          Luwas Admin
        </Link>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-5">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="relative group">
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
                {/* Underline animation */}
                <span
                  className={cn(
                    'absolute left-0 -bottom-0.5 h-0.5 bg-blue-600 transition-all duration-300',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </li>
            );
          })}
        </ul>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold hover:bg-blue-700 transition"
          >
            A
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md border">
              <Link href="/admin/profile" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                Profile
              </Link>
              <Link href="/admin/settings" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                Settings
              </Link>
              <button className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
