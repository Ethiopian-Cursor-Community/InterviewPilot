"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession error:", error);
          router.push("/login");
          return;
        }

        if (data?.session) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (ex) {
        console.error("Auth callback error", ex);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    void handleAuth();
  }, [router]);

  return <p>{loading ? "Signing you in..." : "Redirecting..."}</p>;
}
