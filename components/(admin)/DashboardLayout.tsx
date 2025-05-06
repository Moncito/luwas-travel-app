import AdminNavbar from "@/components/(admin)/AdminNavbar"
import { fetchTotalUsers } from "@/lib/actions/admin.action";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const totalUsers = await fetchTotalUsers()

  return (
    <div className="min-h-screen flex">
      <AdminNavbar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome Admin 👋</h1>
          <p className="text-gray-600">Total Registered Users: {totalUsers}</p>
        </div>
        {children}
      </main>
    </div>
  )
}
