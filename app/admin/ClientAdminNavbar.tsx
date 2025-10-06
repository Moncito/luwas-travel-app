"use client";

import dynamic from "next/dynamic";

// ✅ Correct relative path
const AdminNavbar = dynamic(() => import("@/components/(admin)/AdminNavbar"), {
  ssr: false,
});

export default function ClientAdminNavbar() {
  return <AdminNavbar />;
}
