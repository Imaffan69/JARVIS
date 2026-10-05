import { useEffect, useRef, useState } from "react";
import { Hash, Mic, MicOff, Plus, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useJarvis, useAssistantName } from "@/state/store";
import { cn, formatTime } from "@/lib/utils";

/* Minimal typings for the Web Speech API (browser-only, optional). */
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = "en-US";
  return rec;
}

export function ChatPage() {
  const { chat, topics, activeTopic, setActiveTopic, addTopic, sendChat, agents, tasks } = useJarvis();
  const name = useAssistantName();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVoiceSupported(!!getRecognition());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  const visible = chat.filter((m) => m.topic === activeTopic);

  function send() {
    if (!text.trim()) return;
    sendChat(text.trim());
    setText("");
  }

  function toggleVoice() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      setVoiceSupported(false);
      return;
    }
    recRef.current = rec;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setText((t) => (t ? `${t} ${transcript}` : transcript));
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    setListening(true);
  }

  return (
    <div>
      <PageHeader
        title="Chat"
        subtitle="One identity, topic-isolated context. Voice input uses your device's speech engine; the JARVIS runtime owns Whisper STT on the nodes."
        actions={
          <Badge tone={voiceSupported ? "emerald" : "amber"}>
            {voiceSupported ? "voice ready" : "voice unavailable"}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        {/* Topics */}
        <aside className="glass h-fit rounded-xl p-3">
          <p className="px-2 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Conversations</p>
          <div className="space-y-1">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  activeTopic === t ? "bg-jarvis-cyan/15 text-foreground" : "text-muted-foreground hover:bg-white/[0.04]",
                )}
              >
                <Hash className="size-3.5 shrink-0 opacity-70" />
                <span className="truncate">{t}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-1 border-t border-border/40 pt-3">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="New topic"
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTopic.trim()) {
                  addTopic(newTopic.trim());
                  setActiveTopic(newTopic.trim());
                  setNewTopic("");
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => {
                if (newTopic.trim()) {
                  addTopic(newTopic.trim());
                  setActiveTopic(newTopic.trim());
                  setNewTopic("");
                }
              }}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </aside>

        {/* Conversation */}
        <div className="glass flex h-[calc(100vh-15rem)] flex-col rounded-xl">
          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-5">
            {visible.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <Sparkles className="mx-auto size-8 text-jarvis-cyan/60" />
                  <p className="mt-3 text-sm font-medium text-foreground">Start a conversation in “{activeTopic}”</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Other topics stay isolated — context is not cross-contaminated.
                  </p>
                </div>
              </div>
            ) : (
              visible.map((m) => {
                const messageAgents = agents.filter((a) => m.agentIds?.includes(a.id));
                const task = tasks.find((t) => t.id === m.taskId);
                return (
                  <div
                    key={m.id}
                    className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
                  >
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold",
                        m.role === "user" ? "bg-secondary text-foreground" : "bg-jarvis-cyan/15 font-display text-jarvis-cyan",
                      )}
                    >
                      {m.role === "user" ? "Y" : name.slice(0, 1)}
                    </div>
                    <div className={cn("max-w-[80%]", m.role === "user" && "text-right")}>
                      <div
                        className={cn(
                          "inline-block rounded-xl px-4 py-3 text-left text-sm leading-relaxed",
                          m.role === "user"
                            ? "bg-primary/15 text-foreground hairline"
                            : "bg-white/[0.03] text-foreground/90 hairline",
                        )}
                      >
                        {m.pending ? (
                          <span className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="h-1.5 w-1.5 animate-pulse rounded-full bg-jarvis-cyan"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </span>
                        ) : (
                          m.text
                        )}
                      </div>
                      {messageAgents.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {messageAgents.map((a) => (
                            <Badge key={a.id} tone="violet">
                              {a.label}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {task ? (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-black/30 px-3 py-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-jarvis-emerald" />
                          <span className="text-[11px] text-foreground">{task.title}</span>
                          <span className="font-mono text-[10px] text-jarvis-cyan">{Math.round(task.progress)}%</span>
                        </div>
                      ) : null}
                      <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(m.at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-border/50 p-4">
            <div className="flex items-end gap-2">
              <Button
                variant={listening ? "destructive" : "outline"}
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={toggleVoice}
                title={listening ? "Stop listening" : "Speak"}
              >
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={listening ? "Listening…" : "Message JARVIS — voice, text or command"}
              />
              <Button variant="glow" size="icon" className="h-10 w-10 shrink-0" onClick={send}>
                <Send className="size-4" />
              </Button>
            </div>
            {listening ? (
              <p className="mt-2 text-[11px] text-jarvis-cyan">● Microphone active — release the wake stream to transcribe.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
