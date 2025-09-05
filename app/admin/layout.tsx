import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth as firebaseAuth } from '@/firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import ClientAdminNavbar from '@/components/(admin)/ClientAdminNavbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session?.value) redirect('/admin-log-in');

  try {
    const decoded: DecodedIdToken = await firebaseAuth.verifySessionCookie(session.value, true);
    if (!decoded.admin) redirect('/admin-log-in');
  } catch (err) {
    console.error('🔥 Session verification failed:', err);
    redirect('/admin-log-in');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar at the top */}
      <ClientAdminNavbar />

      {/* ✅ Main content below navbar */}
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
