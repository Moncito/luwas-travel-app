import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth as firebaseAuth, db } from "@/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import ClientAdminNavbar from "@/components/(admin)/ClientAdminNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  // 🔒 Redirect if no session
  if (!session?.value) redirect("/admin-log-in");

  try {
    // ✅ Verify Firebase session cookie
    const decoded: DecodedIdToken = await firebaseAuth.verifySessionCookie(
      session.value,
      true
    );

    let isAdmin = decoded.admin ?? false;

    // 🔍 Double-check Firestore for "admin" role
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decoded.uid).get();
      if (userDoc.exists && userDoc.data()?.role === "admin") {
        isAdmin = true;
      }
    }

    // 🚫 Restrict non-admins in production only
    if (process.env.NODE_ENV === "production" && !isAdmin) {
      redirect("/");
    }
  } catch (err) {
    console.error("🔥 Session verification failed:", err);
    redirect("/admin-log-in");
  }

  // ✅ Authenticated layout
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar (Client-Side for Realtime + Notifications) */}
      <ClientAdminNavbar />

      {/* Page Content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
