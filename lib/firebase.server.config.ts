import { initAuth } from 'next-firebase-auth-edge'
import { cert } from 'firebase-admin/app'


export const authConfig = initAuth({
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  },
  cookieName: 'session',
  cookieSignatureKeys: [process.env.COOKIE_SECRET!],
  cookieSerializeOptions: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
})