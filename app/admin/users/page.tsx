// app/admin/users/page.tsx
import { fetchAllUsers } from "@/lib/admin/fetchUsers";

export default async function AllUsersPage() {
  const users = await fetchAllUsers();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Registered Users</h1>
      <div className="bg-white shadow rounded-lg overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-2 px-4">{user.name || "—"}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4 text-xs text-gray-500">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
