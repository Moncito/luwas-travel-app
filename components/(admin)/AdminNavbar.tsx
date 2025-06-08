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

const navLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'All Users', href: '/admin/users', icon: Users },
  { label: 'All Trips', href: '/admin/trips', icon: MapPin },
  { label: 'Add Destination', href: '/admin/add-destination', icon: PlusCircle },
  { label: 'Add Itineraries', href: '/admin/itineraries', icon: CalendarCheck },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Chat Support', href: '/admin/chat-support', icon: MessageCircle },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <nav className="h-full w-64 bg-white border-r shadow-sm flex flex-col min-h-screen">
      <div className="p-6 text-2xl font-extrabold text-blue-700 tracking-tight">
        Luwas Admin
      </div>
      <ul className="space-y-1 mt-4 px-2">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-md transition-all group',
                  isActive
                    ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-transform duration-150 group-hover:scale-110',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                <span className="text-sm">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
