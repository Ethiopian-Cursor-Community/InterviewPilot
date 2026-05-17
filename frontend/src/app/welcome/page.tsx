import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-surface/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="InterviewPilot" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-semibold text-on-surface">InterviewPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary">
              Log in
            </Link>
            <Link href="/login" className="btn-primary px-6 py-2.5 text-sm">
              Start Interview
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 md:grid-cols-2 md:px-12 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-3 py-1 text-primary">
              <span className="material-symbols-outlined text-lg material-filled">auto_awesome</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Meet Captain, Your AI Coach</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-on-surface md:text-5xl">
              Master Interviews with AI.{" "}
              <span className="brand-gradient-text">Meet Captain.</span>
            </h1>
            <p className="mt-6 text-lg text-on-surface-variant">
              Elevate your career with personalized, real-time AI simulations that mirror top-tier
              technical and behavioral rounds.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
                Start Interview
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/onboarding"
                className="btn-secondary inline-flex items-center gap-2 px-8 py-4"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Upload Resume
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                  <span className="material-symbols-outlined text-white material-filled">smart_toy</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Captain AI</p>
                  <p className="text-xs text-primary">Listening…</p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
                REC: 04:21
              </span>
            </div>
            <div className="space-y-4 rounded-2xl bg-surface-container-low/50 p-4">
              <div className="rounded-2xl rounded-tl-none bg-surface-container-high p-4 text-sm">
                &ldquo;How would you handle a race condition in your caching layer?&rdquo;
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-none border border-primary/20 bg-primary/10 p-4 text-sm">
                &ldquo;I would implement a distributed lock using Redis…&rdquo;
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/20 bg-white/40 p-4">
                <p className="text-xs text-on-surface-variant">Clarity Score</p>
                <p className="text-xl font-semibold text-secondary">92%</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/40 p-4">
                <p className="text-xs text-on-surface-variant">Confidence</p>
                <p className="text-xl font-semibold text-primary">High</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
