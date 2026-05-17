"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

const MODES = [
  {
    id: "hr",
    icon: "person",
    title: "HR Interview",
    description: "Master cultural fit, compensation negotiation, and professional background narratives.",
    meta: "Easy · 30m",
    role: "HR / Behavioral",
  },
  {
    id: "technical",
    icon: "code",
    title: "Technical Interview",
    description: "In-depth technical screening focusing on your specific tech stack and project experience.",
    meta: "Hard · 60m",
    role: "Software Engineer",
  },
  {
    id: "behavioral",
    icon: "psychology",
    title: "Behavioral (STAR)",
    description: "Learn to structure your answers using Situation, Task, Action, and Result.",
    meta: "Medium · 45m",
    role: "Product Manager",
  },
  {
    id: "system",
    icon: "architecture",
    title: "System Design",
    description: "Practice scaling applications, load balancing, and distributed systems architecture.",
    meta: "Expert · 90m",
    role: "Software Engineer",
  },
  {
    id: "coding",
    icon: "terminal",
    title: "Coding Interview",
    description: "Algorithm and data structure challenges with live AI code analysis and hints.",
    meta: "Varies · 60m",
    role: "Software Engineer",
    popular: true,
  },
  {
    id: "mock",
    icon: "domain",
    title: "Mock Company",
    description: "Simulate a target company's specific interview loop and culture.",
    meta: "Dynamic · 2h+",
    role: "Software Engineer",
  },
];

type InterviewMode = (typeof MODES)[number] & { popular?: boolean };

export default function ModesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("english");

  async function startMode(mode: InterviewMode) {
    setLoading(mode.id);
    setError(null);

    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/login");
      return;
    }

    const res = await api.startInterview(session.session.access_token, {
      role: mode.role,
      title: `${mode.title} — ${language === "amharic" ? "Amharic" : "English"}`,
    });

    setLoading(null);

    if (!res.success) {
      setError(res.error);
      return;
    }

    router.push(`/interview/${res.data.interview.id}`);
  }

  return (
    <AppShell activeNav="/modes">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:px-12 md:py-12">
        <section className="mb-12">
          <h1 className="text-3xl font-semibold text-on-surface md:text-4xl">Interview Mode</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Select a specialized track to begin your AI-powered preparation. Each mode is tailored
            to specific industry standards and assessment criteria.
          </p>
        </section>

        {error && (
          <p className="mb-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </p>
        )}

        <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MODES.map((mode) => (
            <article
              key={mode.id}
              className={`glass-card group relative flex flex-col rounded-3xl p-8 transition hover:-translate-y-1 hover:shadow-lg ${
                mode.popular ? "border-2 border-primary/20" : ""
              }`}
            >
              {mode.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-primary">
                  Most Popular
                </span>
              )}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/20 text-primary transition group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
              </div>
              <h3 className="mb-2 text-lg font-medium text-on-surface">{mode.title}</h3>
              <p className="mb-6 flex-grow text-sm text-on-surface-variant">{mode.description}</p>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
                  {mode.meta}
                </span>
                <button
                  type="button"
                  onClick={() => startMode(mode)}
                  disabled={!!loading}
                  className="flex items-center text-sm font-medium text-primary transition group-hover:translate-x-1 disabled:opacity-50"
                >
                  {loading === mode.id ? "Starting…" : "Select Track"}
                  <span className="material-symbols-outlined ml-1 text-lg">chevron_right</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-3xl p-8">
            <h3 className="mb-6 text-lg font-medium text-on-surface">Featured Companies</h3>
            <div className="grid grid-cols-2 gap-4">
              {["Google", "Amazon", "Meta", "Startups"].map((co) => (
                <button
                  key={co}
                  type="button"
                  className="flex items-center gap-4 rounded-xl border border-outline-variant p-4 transition hover:bg-surface-container-low"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
                    <span className="material-symbols-outlined">business</span>
                  </div>
                  <span className="text-sm font-medium">{co}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium text-on-surface">Language Mode</h3>
              <span className="rounded bg-primary-container/10 px-2 py-1 text-xs text-primary">Beta</span>
            </div>
            <div className="space-y-3">
              {[
                { id: "english", label: "English (Professional)", icon: "language" },
                { id: "amharic", label: "Amharic (Native)", icon: "translate" },
                { id: "mixed", label: "Mixed (Hybrid)", icon: "settings_input_component" },
              ].map((lang) => (
                <label
                  key={lang.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-outline-variant p-4 transition hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline">{lang.icon}</span>
                    <span className="text-sm font-medium">{lang.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="language"
                    checked={language === lang.id}
                    onChange={() => setLanguage(lang.id)}
                    className="h-5 w-5 text-primary"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          <Link href="/dashboard" className="text-primary hover:underline">
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
