import { useRef, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  clearCoachMessages,
  listCoachMessages,
  sendCoachMessage,
  type CoachMessageRow,
} from "@/lib/coach.functions";
import { useCoachPanel } from "@/components/coach-panel-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, SendHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

function CoachAssistantBody({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1.5 pl-5 [list-style-position:outside]">{children}</ol>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1.5 pl-5 [list-style-position:outside]">{children}</ul>
        ),
        li: ({ children }) => <li className="leading-relaxed [&>p]:mb-0">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline font-medium text-brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function coachQueryKey(userId: string) {
  return ["coach-messages", userId] as const;
}

export function CoachPanel() {
  const { open, setOpen } = useCoachPanel();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const list = useServerFn(listCoachMessages);
  const send = useServerFn(sendCoachMessage);
  const clear = useServerFn(clearCoachMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const uid = user?.id;

  const messagesQuery = useQuery({
    queryKey: uid ? coachQueryKey(uid) : ["coach-messages", "anonymous"],
    queryFn: async () => {
      const res = await list();
      return res.messages;
    },
    enabled: !!uid && open,
    staleTime: 30_000,
  });

  const messages: CoachMessageRow[] = messagesQuery.data ?? [];

  const sendMut = useMutation({
    mutationFn: async (content: string) => send({ data: { content } }),
    onMutate: async (content) => {
      if (!uid) return;
      await queryClient.cancelQueries({ queryKey: coachQueryKey(uid) });
      const prev = queryClient.getQueryData<CoachMessageRow[]>(coachQueryKey(uid)) ?? [];
      const now = new Date().toISOString();
      const optimistic: CoachMessageRow[] = [
        ...prev,
        { id: `opt-user-${now}`, role: "user", content, created_at: now },
      ];
      queryClient.setQueryData(coachQueryKey(uid), optimistic);
      setInput("");
      return { prev };
    },
    onSuccess: (data) => {
      if (!uid) return;
      queryClient.setQueryData<CoachMessageRow[]>(coachQueryKey(uid), (prev = []) => {
        const withoutOptimistic = prev.filter((m) => !m.id.startsWith("opt-"));
        return [...withoutOptimistic, data.userMessage, data.assistantMessage];
      });
    },
    onError: (e, _content, ctx) => {
      if (uid && ctx?.prev) {
        queryClient.setQueryData(coachQueryKey(uid), ctx.prev);
      }
      toast.error(e instanceof Error ? e.message : "Send failed");
    },
  });

  const clearMut = useMutation({
    mutationFn: async () => clear(),
    onSuccess: () => {
      if (!uid) return;
      queryClient.setQueryData(coachQueryKey(uid), []);
      toast.success("Conversation cleared.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not clear chat"),
  });

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open, sendMut.isPending]);

  function handleSend() {
    const t = input.trim();
    if (!t || sendMut.isPending || !uid) return;
    sendMut.mutate(t);
  }

  const showLoading = authLoading || (!!uid && open && messagesQuery.isLoading);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col sm:max-w-md p-0 gap-0">
        <SheetHeader className="p-4 border-b border-border text-left space-y-1">
          <SheetTitle className="font-display">Interview coach</SheetTitle>
          <SheetDescription className="text-xs">
            Ask for feedback and study tips grounded in your past reports. Chat history is saved to
            your account.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 px-4">
          <div className="py-4 space-y-3">
            {showLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : !uid ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sign in to use the coach.</p>
            ) : messagesQuery.isError ? (
              <p className="text-sm text-destructive text-center py-6">
                Could not load chat. Try again in a moment.
              </p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Say hi — I will use your profile and recent interview reports when relevant.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-brand text-brand-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <CoachAssistantBody text={m.content} />
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            {sendMut.isPending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-3 animate-spin" /> Thinking…
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sendMut.isPending || !uid || showLoading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sendMut.isPending || !input.trim() || !uid || showLoading}
              className="shrink-0 bg-brand text-brand-foreground hover:opacity-90"
            >
              {sendMut.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SendHorizontal className="size-4" />
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground text-xs"
            onClick={() => clearMut.mutate()}
            disabled={messages.length === 0 || clearMut.isPending}
          >
            <Trash2 className="size-3 mr-1" /> Clear conversation
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
