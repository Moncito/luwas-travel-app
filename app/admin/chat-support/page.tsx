'use client'

import { useState } from 'react'
import AdminChatInbox from '@/components/(admin)/AdminChatInbox'
import AdminChatPanel from '@/components/(admin)/AdminChatPanel'

export default function AdminMessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Inbox takes a callback to update selected user */}
      <AdminChatInbox onSelectUser={(id: string) => setSelectedUserId(id)} />

      {/* Only show chat panel when a user is selected */}
      {selectedUserId && (
        <div className="lg:col-span-2">
          <AdminChatPanel userId={selectedUserId} />
        </div>
      )}
    </div>
  )
}
