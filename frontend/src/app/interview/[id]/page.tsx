"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { VoiceControls } from "@/components/VoiceControls";
import { api, type AnswerEvaluation, type Question } from "@/lib/api";

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: interviewId } = use(params);
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push("/login");
      return;
    }

    const token = session.session.access_token;
    setAccessToken(token);

    const res = await api.getInterview(token, interviewId);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return;
    }

    const { interview, questions, report } = res.data;
    setRole(interview.role);

    if (report || interview.status === "completed") {
      router.replace(`/interview/${interviewId}/report`);
      return;
    }

    const unanswered = questions.find((q) => !q.answer);
    if (unanswered) {
      setQuestion(unanswered);
      setQuestionNum(unanswered.sequence);
    } else if (questions.length > 0) {
      setQuestion(questions[questions.length - 1]);
      setQuestionNum(questions.length);
    }

    setLoading(false);
  }, [interviewId, router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError(null);
    setEvaluation(null);

    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const res = await api.submitAnswer(session.session.access_token, {
      interviewId,
      answer: answer.trim(),
    });

    setSubmitting(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setEvaluation(res.data.evaluation);
    setAnswer("");

    if (res.data.nextQuestion) {
      setTimeout(() => {
        setQuestion(res.data.nextQuestion);
        setQuestionNum(res.data.nextQuestion!.sequence);
        setEvaluation(null);
      }, 2500);
    } else {
      router.push(`/interview/${interviewId}/report?auto=1`);
    }
  }

  async function handleEnd() {
    setEnding(true);
    setError(null);

    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const res = await api.endInterview(session.session.access_token, {
      interviewId,
    });

    setEnding(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    router.push(`/interview/${interviewId}/report`);
  }

  if (loading) {
    return (
      <AppShell activeNav="/modes">
        <main className="mx-auto max-w-2xl px-4 py-20 text-center text-on-surface-variant">
          Loading interview…
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="/modes">
      <main className="mx-auto max-w-3xl px-4 py-10 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-primary">Captain · Live Session</p>
            <h1 className="text-xl font-semibold text-on-surface">{role} Interview</h1>
          </div>
          <span className="rounded-full bg-surface-container-low px-3 py-1 text-sm text-on-surface-variant">
            Question {questionNum} of 5
          </span>
        </div>

        {question && (
          <Card className="mb-6">
            <p className="mb-1 text-xs uppercase tracking-wide text-on-surface-variant">
              {question.focus_area ?? "General"}
            </p>
            <p className="text-lg leading-relaxed">{question.text}</p>
            {accessToken && (
              <div className="mt-4 border-t border-outline-variant/30 pt-4">
                <VoiceControls
                  token={accessToken}
                  questionText={question.text}
                  answer={answer}
                  onAnswerChange={setAnswer}
                  disabled={submitting || !!evaluation}
                />
              </div>
            )}
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm text-on-surface-variant">Your answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              disabled={submitting || !!evaluation}
              placeholder="Type or use voice to record your answer…"
              className="input-field resize-none disabled:opacity-60"
            />

            {evaluation && (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 text-sm">
                <p className="mb-2 font-medium text-primary">
                  Evaluator · Score: {evaluation.score}/10
                </p>
                <p className="text-on-surface">{evaluation.feedback}</p>
                {evaluation.strengths.length > 0 && (
                  <p className="mt-2 text-secondary">
                    + {evaluation.strengths.join(", ")}
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="submit"
                loading={submitting}
                disabled={!!evaluation || !answer.trim()}
              >
                Submit answer
              </Button>
              <Button type="button" variant="secondary" onClick={handleEnd} loading={ending}>
                End interview
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </AppShell>
  );
}
