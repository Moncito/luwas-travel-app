// components/admin/UserRow.tsx (Client Component)
"use client";

import { useState } from "react";

export default function UserRow({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <td className="py-4 px-6 text-gray-800 font-medium">
          {user.fullName || user.name || "—"}
        </td>
        <td className="py-4 px-6 text-gray-600">{user.email}</td>
        <td className="py-4 px-6 text-xs text-gray-400">{user.id}</td>
        <td className="py-4 px-6">
          <span className="text-sm text-blue-600 hover:underline">
            {open ? "Hide" : "View"} Details
          </span>
        </td>
      </tr>

      {open && (
        <tr className="bg-gray-50">
          <td colSpan={4} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Detail label="Full Name" value={user.fullName} />
              <Detail label="Email" value={user.email} />
              <Detail label="Phone" value={user.phoneNumber} />
              <Detail label="Age" value={user.age} />
              <Detail label="Gender" value={user.gender} />
              <Detail label="Address" value={user.address} />
              <Detail label="Occupation" value={user.occupation} />
              <Detail label="Income Level" value={user.incomeLevel} />
              <Detail label="Created At" value={user.createdAt} />
              <Detail label="Updated At" value={user.updatedAt} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase">{label}</p>
      <p className="text-gray-800 font-semibold">{value || "—"}</p>
    </div>
  );
}
