"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { api, type Interview } from "@/lib/api";
import { getProfile } from "@/lib/profile";

type HistoryItem = Interview & {
  report?: { overall_score: number; summary: string } | null;
};

export default function DashboardPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("there");

  useEffect(() => {
    const profile = getProfile();
    if (profile?.fullName) {
      setName(profile.fullName.split(" ")[0]);
    }

    async function load() {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = "/login";
        return;
      }

      const res = await api.getHistory(session.session.access_token);
      if (!res.success) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setHistory(res.data.interviews);
      setLoading(false);
    }
    load();
  }, []);

  const avgScore =
    history.filter((h) => h.report).length > 0
      ? Math.round(
          history
            .filter((h) => h.report)
            .reduce((a, h) => a + (h.report?.overall_score ?? 0) * 10, 0) /
            history.filter((h) => h.report).length
        )
      : null;

  return (
    <AppShell activeNav="dashboard">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:px-12 md:py-10">
        <section className="mb-10">
          <h1 className="text-3xl font-semibold text-on-surface md:text-4xl">
            Welcome back, {name}.
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {history.length > 0
              ? "Continue practicing or start a new mission with Captain."
              : "Ready for your first mock round with Captain?"}
          </p>
        </section>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12">
          <Link href="/modes" className="col-span-12 md:col-span-4">
            <Card className="group flex h-full min-h-[220px] flex-col justify-between transition hover:-translate-y-1">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/20 text-primary transition group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                </div>
                <h3 className="mb-2 text-lg font-medium">Start New Interview</h3>
                <p className="text-sm text-on-surface-variant">
                  AI-powered simulation tailored to your role and seniority level.
                </p>
              </div>
              <span className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                Launch Studio <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </Card>
          </Link>

          <Card className="col-span-12 flex flex-col items-center justify-center text-center md:col-span-4">
            <div className="relative mb-4 h-40 w-40">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-surface-container-high"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={452}
                  strokeDashoffset={avgScore != null ? 452 - (452 * avgScore) / 100 : 452 * 0.15}
                  className="text-primary transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold text-on-surface">{avgScore ?? "—"}</span>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">Score</span>
              </div>
            </div>
            <h3 className="text-lg font-medium">{avgScore != null ? "Expert Ready" : "Get Started"}</h3>
            <p className="text-sm text-secondary">
              {avgScore != null ? "Based on completed sessions" : "Complete your first session"}
            </p>
          </Card>

          <div className="col-span-12 flex flex-col gap-6 md:col-span-4">
            <Link href="/onboarding">
              <Card className="flex-grow cursor-pointer border-2 border-dashed border-outline-variant transition hover:border-primary">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest">
                    <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Update Profile</h4>
                    <p className="text-xs text-on-surface-variant">Sync skills & experience</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Card className="flex-grow">
              <h4 className="mb-4 flex justify-between text-sm font-medium">
                Competency Areas
                <span className="material-symbols-outlined text-outline">show_chart</span>
              </h4>
              <div className="space-y-3">
                {[
                  { label: "Behavioral", pct: 72 },
                  { label: "Technical Depth", pct: 58 },
                  { label: "Communication", pct: 65 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{bar.label}</span>
                      <span>{bar.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {loading && <p className="text-on-surface-variant">Loading history…</p>}
        {error && <p className="text-error">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <Card className="text-center">
            <p className="text-on-surface-variant">No interviews yet.</p>
            <Link href="/modes" className="mt-4 inline-block">
              <Button icon="play_circle">Start your first interview with Captain</Button>
            </Link>
          </Card>
        )}

        {history.length > 0 && (
          <section className="glass-card overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/20 px-8 py-6">
              <h3 className="text-xl font-medium">Recent Sessions</h3>
              <span className="text-sm text-primary">View All</span>
            </div>
            <ul className="divide-y divide-white/10">
              {history.map((item) => (
                <li key={item.id}>
                  <Link
                    href={
                      item.status === "completed"
                        ? `/interview/${item.id}/report`
                        : `/interview/${item.id}`
                    }
                    className="flex items-center justify-between gap-4 px-8 py-5 transition hover:bg-surface-container-low"
                  >
                    <div>
                      <p className="font-medium">{item.title || item.role}</p>
                      <p className="text-sm text-on-surface-variant">
                        {item.role} · {item.status} · {item.question_count} questions
                      </p>
                      {item.report && (
                        <p className="mt-1 text-sm text-primary">
                          Score: {item.report.overall_score}/10
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
