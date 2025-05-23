// patchUserId.ts

import admin from 'firebase-admin'
import fs from 'fs'

// ✅ Load service account credentials
const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
)

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

// 🔑 Replace this with your actual UID
const USER_ID = 'KwPLZ3CszhdlkCiEtGSKKhCtxuL2'

async function patchBookings() {
  const collections = ['bookings', 'itineraryBookings']

  for (const colName of collections) {
    const snapshot = await db.collection(colName).get()

    const patchPromises = snapshot.docs.map(async (doc) => {
      const data = doc.data()

      if (!data.userId) {
        await doc.ref.update({ userId: USER_ID })
        console.log(`✅ Patched: ${colName}/${doc.id}`)
      } else {
        console.log(`⏩ Skipped (already has userId): ${colName}/${doc.id}`)
      }
    })

    await Promise.all(patchPromises)
  }

  console.log('🎉 Patching complete.')
}

patchBookings().catch((err) => {
  console.error('❌ Error patching:', err)
})
