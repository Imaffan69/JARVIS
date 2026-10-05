import { Brain, Check, GitBranch, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useJarvis } from "@/state/store";
import { formatRelative } from "@/lib/utils";

const typeTone: Record<string, "cyan" | "emerald" | "amber" | "violet" | "rose" | "default"> = {
  PREFERENCE: "cyan",
  RELATIONSHIP: "violet",
  HABIT: "amber",
  SYSTEM: "default",
  PROJECT: "emerald",
  SEMANTIC: "cyan",
  EPISODIC: "violet",
  LONG_TERM: "emerald",
  SHORT_TERM: "default",
};

export function MemoryPage() {
  const { memories, approveMemory } = useJarvis();
  const pending = memories.filter((m) => !m.approved);

  return (
    <div>
      <PageHeader
        title="Memory"
        subtitle="Only approved information becomes durable. Habits are proposed, never silently adopted — and secrets never enter memory at all."
        actions={<Badge tone="amber">{pending.length} awaiting approval</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {memories.map((m) => (
            <Card key={m.id} className={!m.approved ? "border-jarvis-amber/30" : undefined}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={typeTone[m.type] ?? "default"}>{m.type}</Badge>
                    {!m.approved ? <Badge tone="amber">proposed</Badge> : <Badge tone="emerald">approved</Badge>}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.source}</span>
                </div>
                <p className="mt-3 text-sm text-foreground">{m.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {m.tags.map((t) => (
                    <Badge key={t}>#{t}</Badge>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</p>
                    <Progress value={m.confidence * 100} tone="cyan" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Importance</p>
                    <Progress value={m.importance} tone="violet" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    <p>last used {formatRelative(m.lastUsedAt)}</p>
                    <p>created {formatRelative(m.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                  {m.approved ? (
                    <Button size="sm" variant="outline" onClick={() => approveMemory(m.id, false)}>
                      <X className="size-3.5" /> Revoke
                    </Button>
                  ) : (
                    <Button size="sm" variant="glow" onClick={() => approveMemory(m.id, true)}>
                      <Check className="size-3.5" /> Approve memory
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled>
                    Open topic
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="size-4 text-jarvis-cyan" /> Knowledge graph
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Owner", "works_on", "ZeroKore"],
                ["Owner", "studies", "Class 9"],
                ["Owner", "owns", "ZBook Workstation"],
                ["Owner", "uses", "GitHub"],
                ["Owner", "prefers", "Local AI"],
              ].map(([a, rel, b]) => (
                <div key={`${a}-${rel}-${b}`} className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-white/[0.04] px-2 py-1 text-foreground">{a}</span>
                  <span className="font-mono text-[10px] text-jarvis-cyan">—{rel}→</span>
                  <span className="rounded-md bg-jarvis-cyan/10 px-2 py-1 text-jarvis-cyan">{b}</span>
                </div>
              ))}
              <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                Contextual reasoning uses these edges instead of stuffing every conversation into every prompt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-4 text-jarvis-violet" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <Row label="Total memories" value={String(memories.length)} />
              <Row label="Approved" value={String(memories.filter((m) => m.approved).length)} />
              <Row label="Proposed habits" value={String(pending.length)} />
              <Row label="Credential refs stored" value="0 (vault)" />
              <div className="flex items-center gap-2 rounded-lg bg-jarvis-emerald/10 px-3 py-2 text-jarvis-emerald">
                <Sparkles className="size-3.5" /> Secrets never enter memory or embeddings.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
