"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveProfile, type UserProfile } from "@/lib/profile";

const LEVELS: { value: UserProfile["level"]; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
];

const DEFAULT_SKILLS = ["React", "TypeScript", "Tailwind"];

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [level, setLevel] = useState<UserProfile["level"]>("mid");
  const [skills, setSkills] = useState<string[]>(DEFAULT_SKILLS);
  const [skillInput, setSkillInput] = useState("");

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile({ fullName, headline, level, skills, completed: true });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-xl font-semibold text-on-surface">InterviewPilot</span>
          <span className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">help</span>
            Support
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-on-surface">Complete your profile</h1>
            <p className="mt-1 text-on-surface-variant">
              Let&apos;s tailor your AI interview experience.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="h-1.5 w-8 rounded-full bg-primary" />
            <div className="h-1.5 w-4 rounded-full bg-surface-container-highest" />
            <div className="h-1.5 w-4 rounded-full bg-surface-container-highest" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="glass-card rounded-3xl p-8 md:p-10">
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-surface-container-low shadow-lg">
                  <Image src="/logo.jpg" alt="" width={128} height={128} className="object-cover" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-on-primary shadow-lg"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                </button>
              </div>
              <div className="w-full flex-1 space-y-6">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                />
                <Input
                  label="Professional Headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full Stack Developer | UX Enthusiast"
                />
              </div>
            </div>
          </section>

          <section className="glass-card space-y-8 rounded-3xl p-8 md:p-10">
            <div>
              <h3 className="mb-4 text-lg font-medium text-on-surface">Experience Level</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {LEVELS.map((l) => (
                  <label key={l.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      className="peer hidden"
                      checked={level === l.value}
                      onChange={() => setLevel(l.value)}
                    />
                    <div className="rounded-xl border-2 border-transparent bg-surface-container-low p-4 text-center transition peer-checked:border-primary peer-checked:bg-primary-container/20 hover:bg-surface-container-high">
                      <span className="text-sm font-medium">{l.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium text-on-surface">Skills & Tech Stack</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm text-on-primary"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}>
                      <span className="material-symbols-outlined cursor-pointer text-base">close</span>
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-highest px-4 py-1.5">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add skill"
                    className="w-24 border-none bg-transparent text-sm outline-none"
                  />
                  <button type="button" onClick={addSkill}>
                    <span className="material-symbols-outlined text-lg text-on-surface-variant">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" icon="navigate_next">
              Continue to Dashboard
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
