// app/admin/trips/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import DestinationCard from '@/components/(admin)/DestinationCard'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminTripsPage() {
  const [destinations, setDestinations] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'destinations'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setDestinations(data)
    }
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'destinations', id))
      setDestinations(prev => prev.filter(d => d.id !== id))
      toast.success('Destination deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete destination')
    }
  }

  return (
    <section className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Manage Trips</h1>
        <Link href="/admin/add-destination" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Destination
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <DestinationCard key={dest.id} destination={dest} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  )
}
