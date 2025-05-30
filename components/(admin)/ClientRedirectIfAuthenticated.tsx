"use client";

import { useEffect } from "react";
import { auth } from "@/firebase/client";
import { getIdTokenResult } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ClientRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await getIdTokenResult(user);
        if (tokenResult.claims.admin) {
          router.replace("/admin");
        }
      }
    };

    checkAuth();
  }, [router]);

  return null;
}
