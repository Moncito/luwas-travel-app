import admin from 'firebase-admin'

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env.local')
  }

  const serviceAccount = JSON.parse(
    Buffer.from(key, 'base64').toString('utf8')
  )

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export const adminDb = admin.firestore()
