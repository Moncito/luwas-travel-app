// lib/verifySession.ts
import { adminAuth } from '@/lib/firebaseAdmin'

export async function verifyUserSession(cookie: string | undefined) {
  if (!cookie) return null

  try {
    const decodedToken = await adminAuth.verifySessionCookie(cookie, true)
    return decodedToken
  } catch (err) {
    console.error('Session verification failed:', err)
    return null
  }
}
