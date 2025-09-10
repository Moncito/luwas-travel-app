// app/admin/users/page.tsx (Server Component)
export const dynamic = "force-dynamic";

import UserRow from "@/components/(admin)/UserRow";
import { fetchAllUsers } from "@/lib/admin/fetchUsers";


export default async function AllUsersPage() {
  const users = await fetchAllUsers();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-900">
        All Registered Users
      </h1>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="py-4 px-6 text-left text-blue-700 font-semibold">
                Name
              </th>
              <th className="py-4 px-6 text-left text-blue-700 font-semibold">
                Email
              </th>
              <th className="py-4 px-6 text-left text-blue-700 font-semibold">
                UID
              </th>
              <th className="py-4 px-6 text-left text-blue-700 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
