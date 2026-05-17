import { useRef, useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { sendCoachMessage } from "@/lib/coach.functions";
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

type StoredMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

function storageKey(userId: string) {
  return `interviewpilot-coach-v1:${userId}`;
}

export function CoachPanel() {
  const { open, setOpen } = useCoachPanel();
  const { user, loading: authLoading } = useAuth();
  const send = useServerFn(sendCoachMessage);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<StoredMsg[]>([]);
  const [storeReady, setStoreReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const uid = user?.id;

  useEffect(() => {
    if (!uid) {
      setMessages([]);
      setStoreReady(true);
      return;
    }
    setStoreReady(false);
    try {
      const raw = localStorage.getItem(storageKey(uid));
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (m): m is StoredMsg =>
              m &&
              typeof m === "object" &&
              typeof (m as StoredMsg).id === "string" &&
              ((m as StoredMsg).role === "user" || (m as StoredMsg).role === "assistant") &&
              typeof (m as StoredMsg).content === "string",
          );
          setMessages(cleaned);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
    setStoreReady(true);
  }, [uid]);

  useEffect(() => {
    if (!uid || !storeReady) return;
    try {
      localStorage.setItem(storageKey(uid), JSON.stringify(messages));
    } catch {
      toast.error("Could not save coach chat locally (storage full?).");
    }
  }, [uid, messages, storeReady]);

  const sendMut = useMutation({
    mutationFn: async (content: string) => {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      return send({ data: { content, history } });
    },
    onSuccess: (data, content) => {
      const now = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content, created_at: now },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          created_at: now,
        },
      ]);
      setInput("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Send failed"),
  });

  const clearLocal = useCallback(() => {
    setMessages([]);
    if (uid) {
      try {
        localStorage.removeItem(storageKey(uid));
      } catch {
        /* empty */
      }
    }
    toast.success("Conversation cleared.");
  }, [uid]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open, sendMut.isPending]);

  function handleSend() {
    const t = input.trim();
    if (!t || sendMut.isPending || !uid) return;
    sendMut.mutate(t);
  }

  const showLoading = authLoading || (!!uid && !storeReady);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col sm:max-w-md p-0 gap-0">
        <SheetHeader className="p-4 border-b border-border text-left space-y-1">
          <SheetTitle className="font-display">Interview coach</SheetTitle>
          <SheetDescription className="text-xs">
            Ask for feedback and study tips grounded in your past reports. Chat is saved on this device
            only.
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
            onClick={clearLocal}
            disabled={messages.length === 0}
          >
            <Trash2 className="size-3 mr-1" /> Clear conversation
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
