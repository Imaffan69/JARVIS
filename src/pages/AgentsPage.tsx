import { Pause, Play, Sparkles, UserCog } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useJarvis } from "@/state/store";
import { cn } from "@/lib/utils";

export function AgentsPage() {
  const { agents, nodes, models, globalMode, parallelAgents, toggleFlag } = useJarvis();
  const active = agents.filter((a) => a.state === "active").length;

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Specialists are matched to capabilities, not personalities. Each one runs sandboxed with only the permissions its task requires."
        actions={
          <>
            <Badge tone="violet">{active} active</Badge>
            <Badge tone={parallelAgents ? "emerald" : "default"}>parallelism {parallelAgents ? "on" : "off"}</Badge>
            <Button
              variant={parallelAgents ? "outline" : "glow"}
              size="sm"
              onClick={() => toggleFlag("parallelAgents")}
            >
              <Sparkles className="size-3.5" /> {parallelAgents ? "Disable" : "Enable"} parallel teams
            </Button>
          </>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-5 text-xs text-muted-foreground">
          <span>
            Global mode <Badge tone="cyan" className="ml-1">{globalMode}</Badge>
          </span>
          <span>Master decides final result on disagreement — evidence beats votes.</span>
          <span className="font-mono">{agents.length} registered · {nodes.filter((n) => n.status !== "offline").length} schedulable nodes · {models.filter((m) => m.loaded).length} models loaded</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => {
          const node = nodes.find((n) => n.id === a.nodeId);
          const model = models.find((m) => m.id === a.modelId);
          const activeState = a.state === "active";
          return (
            <Card
              key={a.id}
              className={cn(
                "transition-all",
                activeState && "border-jarvis-cyan/40 shadow-[0_0_36px_-18px_rgba(34,211,238,0.7)]",
              )}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-lg",
                        activeState ? "bg-jarvis-cyan/15" : "bg-white/[0.04]",
                      )}
                    >
                      <UserCog className={cn("size-5", activeState ? "text-jarvis-cyan" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{a.label}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{a.kind}</p>
                    </div>
                  </div>
                  <Badge
                    tone={
                      a.state === "active"
                        ? "emerald"
                        : a.state === "complete"
                          ? "cyan"
                          : a.state === "blocked"
                            ? "rose"
                            : a.state === "waiting"
                              ? "amber"
                              : "default"
                    }
                  >
                    {a.state}
                  </Badge>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{a.summary}</p>

                {activeState ? (
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={a.progress} className="flex-1" />
                    <span className="font-mono text-[11px] text-muted-foreground">{Math.round(a.progress)}%</span>
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <p className="text-muted-foreground">Node</p>
                    <p className="truncate font-mono text-foreground">{node?.name ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <p className="text-muted-foreground">Model</p>
                    <p className="truncate font-mono text-foreground">{model?.name ?? "—"}</p>
                  </div>
                </div>

                {a.permissions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {a.permissions.map((p) => (
                      <Badge key={p} tone="amber">
                        {p}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 font-mono text-[10px] text-muted-foreground">no elevated permissions</p>
                )}

                <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleAgent(a.id)}
                  >
                    {activeState ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    {activeState ? "Pause" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  function toggleAgent(id: string) {
    useJarvis.setState((s) => ({
      agents: s.agents.map((a) =>
        a.id === id
          ? { ...a, state: a.state === "active" ? "waiting" : "active", progress: a.state === "active" ? a.progress : Math.max(a.progress, 5) }
          : a,
      ),
    }));
  }
}
