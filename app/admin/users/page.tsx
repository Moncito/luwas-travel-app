// app/admin/users/page.tsx
import { fetchAllUsers } from "@/lib/admin/fetchUsers";

export default async function AllUsersPage() {
  const users = await fetchAllUsers();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Registered Users</h1>
      <div className="bg-white shadow-md rounded-lg overflow-auto">
        <table className="min-w-full">
          <thead className="bg-blue-100 text-left">
            <tr>
              <th className="py-4 px-6 text-blue-600 font-semibold">Name</th>
              <th className="py-4 px-6 text-blue-600 font-semibold">Email</th>
              <th className="py-4 px-6 text-blue-600 font-semibold">User ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="py-4 px-6 text-gray-800">{user.name || "—"}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6 text-xs text-gray-400">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}