"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/modes", label: "Simulator", icon: "psychology" },
  { href: "/dashboard", label: "Flight Reports", icon: "assessment" },
  { href: "/onboarding", label: "Profile", icon: "person" },
] as const;

export function AppShell({
  children,
  activeNav = "dashboard",
}: {
  children: React.ReactNode;
  activeNav?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, key: string) {
    if (activeNav === key) return true;
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href === "/modes" && pathname.startsWith("/interview")) return true;
    if (href === "/dashboard" && pathname.includes("/report")) return true;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="glass-sidebar fixed left-0 top-0 z-40 hidden h-full w-64 flex-col py-6 md:flex">
        <div className="mb-8 flex flex-col items-center gap-2 px-6">
          <Image src="/logo.jpg" alt="InterviewPilot" width={40} height={40} className="rounded-xl object-contain" />
          <div className="text-center">
            <p className="brand-gradient-text text-lg font-semibold">InterviewPilot</p>
            <p className="text-xs text-on-surface-variant">Premium AI Prep</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive(item.href, item.href)
                  ? "bg-primary-container/20 text-primary border-l-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.href, item.href) ? "material-filled" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 px-4">
          <Link
            href="/modes"
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            New Mission
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="md:ml-64 flex min-h-screen flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/20 bg-surface/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-on-surface">InterviewPilot</span>
          </div>
          <div className="flex gap-2">
            <button type="button" className="p-2 text-on-surface-variant">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link href="/modes" className="btn-primary px-3 py-2 text-sm">
              <span className="material-symbols-outlined text-lg">add</span>
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-white/20 bg-surface/90 py-3 backdrop-blur-xl md:hidden">
          {NAV.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-2 text-xs ${
                isActive(item.href, item.href) ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
