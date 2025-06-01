import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth as firebaseAuth } from "@/firebase/admin";
import AdminNavbar from "@/components/(admin)/AdminNavbar";
import type { DecodedIdToken } from "firebase-admin/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies(); // ✅ no need for `await`
  const session = cookieStore.get("session");

  if (!session?.value) redirect("/admin-log-in"); // ✅ Updated

  try {
    const decoded: DecodedIdToken = await firebaseAuth.verifySessionCookie(session.value, true);

    if (!decoded.admin) {
      redirect("/admin-log-in"); // ✅ Updated
    }
  } catch (err) {
    console.error("🔥 Session verification failed:", err);
    redirect("/admin-log-in"); // ✅ Updated
  }

  return (
    <div className="min-h-screen flex">
      <AdminNavbar />
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
