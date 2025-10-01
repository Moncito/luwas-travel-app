import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth as firebaseAuth, db } from "@/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import ClientAdminNavbar from "@/components/(admin)/ClientAdminNavbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (!session?.value) redirect("/admin-log-in");

  try {
    const decoded: DecodedIdToken = await firebaseAuth.verifySessionCookie(session.value, true);

    let isAdmin = decoded.admin ?? false;

    // 🔍 Firestore fallback
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decoded.uid).get();
      if (userDoc.exists && userDoc.data()?.role === "admin") {
        isAdmin = true;
      }
    }

    // ✅ DEV mode: allow all authenticated
    // ✅ PROD mode: restrict
    if (process.env.NODE_ENV === "production" && !isAdmin) {
      redirect("/"); // safer fallback instead of looping
    }
  } catch (err) {
    console.error("🔥 Session verification failed:", err);
    redirect("/admin-log-in");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      <ClientAdminNavbar />

      {/* ✅ Main content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
