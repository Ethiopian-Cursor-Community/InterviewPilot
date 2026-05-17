import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
  head: () => ({ meta: [{ title: "Signing in · InterviewPilot" }] }),
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error: ex } = await supabase.auth.exchangeCodeForSession(code);
        if (ex) {
          setError(ex.message);
          return;
        }
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const hp = new URLSearchParams(hash);
        const access = hp.get("access_token");
        const refresh = hp.get("refresh_token");
        if (access && refresh) {
          const { error: ex } = await supabase.auth.setSession({
            access_token: access,
            refresh_token: refresh,
          });
          if (ex) {
            setError(ex.message);
            return;
          }
          navigate({ to: "/dashboard", replace: true });
          return;
        }
      }

      setError("Missing OAuth response. Try signing in again.");
    };

    void run();
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-background">
      <div
        className="absolute inset-0 grid-bg pointer-events-none opacity-60"
        aria-hidden
      />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 text-center fade-in space-y-4">
        <Link to="/" className="flex items-center gap-2 justify-center mb-4 group">
          <div className="size-9 rounded-lg bg-gradient-brand grid place-items-center shadow-sm shadow-brand/30 group-hover:rotate-6 transition-transform">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">InterviewPilot</span>
        </Link>

        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <Button asChild variant="outline">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">Completing sign-in…</p>
          </div>
        )}
      </div>
    </div>
  );
}
