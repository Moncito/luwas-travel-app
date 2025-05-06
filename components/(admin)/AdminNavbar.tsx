"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "All Users", href: "/admin/users" },
  { label: "All Trips", href: "/admin/trips" },
  { label: "Add Destination", href: "/admin/add-destination" },
];

const AdminNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="h-full w-64 bg-white border-r shadow-sm flex flex-col min-h-screen">
      <div className="p-6 text-2xl font-bold text-blue-700">Luwas Admin</div>
      <ul className="space-y-2 mt-4 px-4 list-none">
        {navLinks.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "block px-4 py-2 rounded-lg hover:bg-blue-50 transition-all",
                pathname === href ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700"
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNavbar;
