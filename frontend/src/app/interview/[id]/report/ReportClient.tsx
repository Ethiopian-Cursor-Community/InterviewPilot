"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { api, type Report } from "@/lib/api";

function scorePercent(score: number) {
  return Math.min(100, Math.max(0, Math.round(score * 10)));
}

function subScores(overall: number) {
  const base = scorePercent(overall);
  return [
    { label: "Communication", pct: Math.min(100, base + 7), color: "bg-secondary", icon: "chat_bubble" },
    { label: "Technical Proficiency", pct: Math.max(0, base - 6), color: "bg-primary", icon: "terminal" },
    { label: "Confidence", pct: Math.min(100, base + 4), color: "bg-tertiary", icon: "psychology" },
    { label: "Clarity & Structure", pct: Math.max(0, base - 12), color: "bg-error", icon: "lightbulb" },
  ];
}

export function ReportClient({
  interviewId,
  autoEnd,
}: {
  interviewId: string;
  autoEnd: boolean;
}) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/login");
      return;
    }

    const token = session.session.access_token;
    const res = await api.getInterview(token, interviewId);

    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }

    if (!res.data.report && autoEnd) {
      setGenerating(true);
      const endRes = await api.endInterview(token, { interviewId });
      setGenerating(false);

      if (!endRes.success) {
        setError(endRes.error);
        setLoading(false);
        return;
      }

      setReport(endRes.data.report);
      setLoading(false);
      return;
    }

    if (res.data.report) {
      setReport(res.data.report);
    }

    setLoading(false);
  }, [interviewId, autoEnd, router]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  async function generateReport() {
    setGenerating(true);
    setError(null);

    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const res = await api.endInterview(session.session.access_token, {
      interviewId,
    });

    setGenerating(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setReport(res.data.report);
  }

  if (loading || generating) {
    return (
      <AppShell activeNav="dashboard">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <span className="material-symbols-outlined mb-4 animate-pulse text-5xl text-primary">auto_awesome</span>
          <p className="text-lg font-medium text-on-surface">Captain is preparing your feedback report…</p>
          <p className="mt-2 text-sm text-on-surface-variant">This usually takes a few seconds</p>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell activeNav="dashboard">
        <div className="mx-auto max-w-lg px-4 py-10">
          <Card>
            <h1 className="mb-2 text-xl font-semibold text-on-surface">Feedback Report</h1>
            <p className="text-on-surface-variant">No report yet for this interview.</p>
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
            <Button className="mt-6" onClick={generateReport} loading={generating}>
              Generate report
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  const pct = scorePercent(report.overall_score);
  const subs = subScores(report.overall_score);

  return (
    <AppShell activeNav="dashboard">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:px-12">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold text-on-surface md:text-3xl">Feedback Report</h1>
          <p className="mt-1 text-on-surface-variant">AI-powered performance analysis from Captain</p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-10 text-center lg:col-span-5">
            <div
              className="circular-progress relative flex h-56 w-56 items-center justify-center rounded-full"
              style={{ "--percentage": pct } as React.CSSProperties}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-5xl font-semibold text-primary">{pct}</span>
                <span className="mt-1 text-xs font-medium tracking-widest text-outline">OVERALL SCORE</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-on-surface-variant">
              {report.overall_score}/10 overall · Report Agent
            </p>
            <Link href="/modes" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
              Start targeted mock session
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:col-span-7">
            {subs.map((s) => (
              <Card key={s.label} className="flex flex-col justify-between rounded-3xl p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-2xl p-3 ${s.color}/20`}>
                    <span className={`material-symbols-outlined ${s.color.replace("bg-", "text-")}`}>{s.icon}</span>
                  </div>
                  <span className="text-2xl font-medium text-on-surface">{s.pct}%</span>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-on-surface">{s.label}</h4>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="rounded-3xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">task_alt</span>
                <h3 className="text-lg font-medium">Core Strengths</h3>
              </div>
              <ul className="space-y-4">
                {report.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    <p className="text-on-surface-variant">{s}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="rounded-3xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-error">warning</span>
                <h3 className="text-lg font-medium">Areas for Growth</h3>
              </div>
              <ul className="space-y-4">
                {report.weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                    <p className="text-on-surface-variant">{w}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="rounded-3xl p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">summarize</span>
              <h3 className="text-lg font-medium">Executive Summary</h3>
            </div>
            <p className="leading-relaxed text-on-surface-variant">{report.summary}</p>

            <div className="mt-8 border-t border-outline-variant/30 pt-8">
              <h4 className="mb-4 text-sm font-semibold text-on-surface">Personalized improvement steps</h4>
              <ol className="space-y-4">
                {report.recommendations.map((r, i) => (
                  <li key={r} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-on-surface-variant">{r}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </section>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
          <Link href="/modes">
            <Button>Practice again</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
