import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { cursorText } from "@/lib/cursor-llm";
import { z } from "zod";

const coachHistoryEntry = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(12000),
});

/**
 * AI coach replies (Cursor LLM). Conversation history is supplied by the client
 * and persisted in localStorage so no `coach_messages` table is required.
 */
export const sendCoachMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { content: string; history: z.infer<typeof coachHistoryEntry>[] }) =>
    z
      .object({
        content: z.string().min(1).max(8000),
        history: z.array(coachHistoryEntry).max(40).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, target_role, experience_level, skills")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: reports } = await supabase
      .from("reports")
      .select("overall_score, summary, weaknesses, improvement_roadmap, interview_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const interviewIds = [...new Set((reports ?? []).map((r) => r.interview_id))];
    const { data: interviewRows } =
      interviewIds.length > 0
        ? await supabase
            .from("interviews")
            .select("id, mode, role, interviewer_persona")
            .in("id", interviewIds)
            .eq("user_id", userId)
        : { data: [] as { id: string; mode: string; role: string | null; interviewer_persona: string | null }[] };

    const ivById = new Map((interviewRows ?? []).map((i) => [i.id, i]));

    const reportLines = (reports ?? []).map((r) => {
      const iv = ivById.get(r.interview_id);
      const weaknesses = (r.weaknesses ?? []).slice(0, 3).join("; ") || "n/a";
      const roadmap = (r.improvement_roadmap ?? []).slice(0, 2).join("; ") || "n/a";
      return `- ${iv?.role ?? "Interview"} (${iv?.mode ?? "?"}, ${iv?.interviewer_persona ?? "?"}, score ${r.overall_score ?? "?"}) — weaknesses: ${weaknesses}; roadmap: ${roadmap}; summary: ${(r.summary ?? "").slice(0, 200)}`;
    });

    const system = `You are the user's AI interview coach.
- Be concise, specific, and actionable.
- When the user asks about their performance, ground every claim in the prior interview reports below.
- If asked about something not in the reports, answer like a senior career coach but say you're answering generally.

USER PROFILE:
- Display name: ${profile?.display_name ?? "unknown"}
- Target role: ${profile?.target_role ?? "unknown"}
- Experience level: ${profile?.experience_level ?? "unknown"}
- Skills: ${(profile?.skills ?? []).join(", ") || "n/a"}

RECENT INTERVIEWS (most recent first):
${reportLines.length ? reportLines.join("\n") : "No reports yet — encourage them to complete an interview first."}`;

    const convo = data.history
      .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
      .join("\n");

    const prompt = `${convo ? `Conversation so far:\n${convo}\n\n` : ""}USER: ${data.content}\n\nASSISTANT:`;

    const reply = (await cursorText(prompt, { system })).trim();
    return { reply };
  });
