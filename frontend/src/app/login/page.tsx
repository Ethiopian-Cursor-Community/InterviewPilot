"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isProfileComplete } from "@/lib/profile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    const next = isProfileComplete() ? "/dashboard" : "/onboarding";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo.jpg" alt="InterviewPilot" width={64} height={64} className="mb-4 rounded-2xl" />
          <h1 className="text-3xl font-semibold tracking-tight text-on-surface">InterviewPilot</h1>
          <p className="mt-2 text-on-surface-variant">
            Elevate your interview performance with AI
          </p>
        </div>

        <div className="glass-card relative overflow-hidden rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                !isSignUp
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                isSignUp
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              icon="mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
            <Input
              label="Password"
              icon="lock"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {isSignUp ? "Create account" : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-on-surface-variant">
          <span className="flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-lg">verified_user</span>
            Enterprise Secure
          </span>
          <span className="flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-lg">support_agent</span>
            24/7 Support
          </span>
        </div>
      </main>
    </div>
  );
}
