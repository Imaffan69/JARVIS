import { useState } from "react";
import { ArrowRightLeft, Ban, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useJarvis } from "@/state/store";
import { cn, formatRelative } from "@/lib/utils";
import type { TaskPriority, TaskState } from "@/types";

const stateTone: Record<TaskState, "default" | "cyan" | "emerald" | "amber" | "rose" | "violet"> = {
  QUEUED: "default",
  PLANNING: "violet",
  ASSIGNED: "cyan",
  RUNNING: "emerald",
  WAITING: "amber",
  PAUSED: "amber",
  MIGRATING: "violet",
  RETRYING: "amber",
  BLOCKED: "rose",
  COMPLETED: "emerald",
  FAILED: "rose",
  CANCELLED: "default",
};

const filters: Array<TaskState | "ALL" | "ACTIVE"> = ["ALL", "ACTIVE", "RUNNING", "PAUSED", "COMPLETED", "FAILED"];

export function TasksPage() {
  const { tasks, nodes, agents, createTask, setTaskState, migrateTask } = useJarvis();
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");

  const visible = tasks.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return ["RUNNING", "ASSIGNED", "PLANNING", "MIGRATING", "WAITING", "RETRYING"].includes(t.state);
    return t.state === filter;
  });

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Every task carries required capabilities, permissions, priority and checkpoints so it can pause, resume, migrate or cancel safely."
        actions={<Badge tone="cyan">{tasks.length} total</Badge>}
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe a goal — e.g. “Research and draft a physics lab report”"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="h-10 rounded-md border border-input bg-white/[0.03] px-3 text-sm text-foreground focus-visible:outline-none"
          >
            {(["CRITICAL", "HIGH", "NORMAL", "LOW", "BACKGROUND", "IDLE"] as TaskPriority[]).map((p) => (
              <option key={p} value={p} className="bg-slate-900">
                {p}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              if (title.trim()) {
                createTask(title.trim(), priority);
                setTitle("");
              }
            }}
          >
            <Plus className="size-4" /> Create task
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] transition-colors",
              filter === f
                ? "border-jarvis-cyan/50 bg-jarvis-cyan/15 text-jarvis-cyan"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((t) => {
          const node = nodes.find((n) => n.id === t.assignedNodeId);
          const taskAgents = agents.filter((a) => t.agentIds.includes(a.id));
          return (
            <Card key={t.id}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={t.priority === "CRITICAL" ? "rose" : t.priority === "HIGH" ? "amber" : "default"}>
                      {t.priority}
                    </Badge>
                    <Badge tone={stateTone[t.state]} className="font-mono">
                      {t.state}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Progress value={t.progress} className="flex-1" tone={t.state === "PAUSED" ? "amber" : "cyan"} />
                  <span className="font-mono text-[11px] text-muted-foreground">{Math.round(t.progress)}%</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>{node?.name ?? "unassigned"}</Badge>
                  <Badge tone="violet">{t.dataClass}</Badge>
                  {taskAgents.slice(0, 3).map((a) => (
                    <Badge key={a.id} tone="cyan">
                      {a.kind}
                    </Badge>
                  ))}
                </div>

                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t.audit.length} checkpoints · updated {formatRelative(t.updatedAt)} · {t.requiredCapabilities.length} required
                  capabilities
                </p>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
                  {t.state === "PAUSED" ? (
                    <Button size="sm" variant="outline" onClick={() => setTaskState(t.id, "RUNNING")}>
                      <Play className="size-3.5" /> Resume
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={t.state === "COMPLETED" || t.state === "CANCELLED"}
                      onClick={() => setTaskState(t.id, "PAUSED")}
                    >
                      <Pause className="size-3.5" /> Pause
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={t.state === "COMPLETED" || t.state === "CANCELLED"}
                    onClick={() => setTaskState(t.id, "CANCELLED")}
                  >
                    <Ban className="size-3.5" /> Cancel
                  </Button>
                  <select
                    className="h-8 rounded-md border border-input bg-white/[0.03] px-2 text-xs text-foreground"
                    value={t.assignedNodeId ?? ""}
                    onChange={(e) => e.target.value && migrateTask(t.id, e.target.value)}
                  >
                    <option value="" className="bg-slate-900">
                      Migrate to…
                    </option>
                    {nodes
                      .filter((n) => n.status !== "offline")
                      .map((n) => (
                        <option key={n.id} value={n.id} className="bg-slate-900">
                          {n.name}
                        </option>
                      ))}
                  </select>
                  {(t.state === "FAILED" || t.state === "CANCELLED") && (
                    <Button size="sm" variant="ghost" onClick={() => setTaskState(t.id, "QUEUED")}>
                      <RotateCcw className="size-3.5" /> Retry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="pt-10 pb-10 text-center text-sm text-muted-foreground">
              <ArrowRightLeft className="mx-auto mb-3 size-6 opacity-50" />
              No tasks match this filter.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
