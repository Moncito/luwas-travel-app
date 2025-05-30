import AdminAuthForm from "../admin/log-in/AdminAuthForm";
import ClientRedirectIfAuthenticated from "@/components/(admin)/ClientRedirectIfAuthenticated";

export default function AdminLoginPage() {
  return (
    <>
      <ClientRedirectIfAuthenticated />
      <AdminAuthForm />
    </>
  );
}
