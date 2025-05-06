import AdminNavbar from "@/components/(admin)/AdminNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AdminNavbar />
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
