import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Cpu,
  Gauge,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadialGauge, MetricRow, KeyValue } from "@/components/ui/stat";
import { ModeBadge } from "@/components/ModeBadge";
import { useJarvis } from "@/state/store";
import { formatRelative, heatColor } from "@/lib/utils";
import type { EventLogItem } from "@/types";

const severityTone: Record<EventLogItem["severity"], "cyan" | "amber" | "rose" | "emerald" | "default"> = {
  info: "cyan",
  warn: "amber",
  error: "rose",
  success: "emerald",
};

export function CommandPage() {
  const { owner, nodes, agents, tasks, models, events, privacy, audit, runCommand, globalMode } = useJarvis();
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const online = nodes.filter((n) => n.status !== "offline");
  const activeAgents = agents.filter((a) => a.state === "active");
  const runningTasks = tasks.filter((t) => ["RUNNING", "ASSIGNED", "PLANNING", "MIGRATING"].includes(t.state));
  const avgCpu = online.length ? online.reduce((s, n) => s + n.cpu, 0) / online.length : 0;
  const avgRam = online.length ? online.reduce((s, n) => s + n.ram, 0) / online.length : 0;
  const hottest = online.reduce((m, n) => Math.max(m, n.temperature), 0);
  const blocked = privacy.filter((p) => p.outcome === "BLOCKED").length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    runCommand(input.trim());
    setInput("");
    navigate("/app/chat");
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${owner?.name ?? "Owner"}`}
        subtitle="One intelligence, distributed across your nodes. Everything routes through the master orchestrator."
        actions={
          <>
            <Badge tone="emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-jarvis-emerald" /> {online.length} nodes online
            </Badge>
            <ModeBadge mode={globalMode} />
            <Link to="/app/chat">
              <Button variant="glow" size="sm">
                <Sparkles className="size-3.5" /> New command
              </Button>
            </Link>
          </>
        }
      />

      {/* Quick command */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Zap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-jarvis-cyan" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try: "Use all agents to build a website" · "Show all devices" · "Put everything in FAST"'
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="default">
              <Send className="size-4" /> Dispatch
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Use all agents", "Only use local models", "Show devices", "Morning briefing", "Put system in REST"].map((c) => (
              <button
                key={c}
                onClick={() => runCommand(c)}
                className="rounded-full border border-border/60 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-jarvis-cyan/50 hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stat row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Cpu} label="Nodes online" value={`${online.length}/${nodes.length}`} hint={`${nodes.filter((n) => n.mode === "REST").length} in REST mode`} tone="cyan" />
        <StatCard icon={Sparkles} label="Active agents" value={`${activeAgents.length}`} hint={`${agents.length} registered specialists`} tone="violet" />
        <StatCard icon={Gauge} label="Running tasks" value={`${runningTasks.length}`} hint={`${tasks.filter((t) => t.state === "COMPLETED").length} completed`} tone="emerald" />
        <StatCard icon={ShieldCheck} label="Blocked external calls" value={`${blocked}`} hint={`${audit.filter((a) => a.result === "DENIED").length} denied actions audited`} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resource pool gauges */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Resource pool</CardTitle>
            <Link to="/app/devices" className="text-[11px] text-jarvis-cyan hover:underline">
              all devices
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-around">
              <RadialGauge value={avgCpu} label="CPU" sub="avg" />
              <RadialGauge value={avgRam} label="RAM" sub="avg" />
              <RadialGauge value={hottest} label="Temp" sub="max °C" />
            </div>
            <div className="space-y-3">
              {online.slice(0, 3).map((n) => (
                <div key={n.id} className="rounded-lg border border-border/40 bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{n.name}</span>
                    <ModeBadge mode={n.mode} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricRow label="CPU" value={n.cpu} />
                    <MetricRow label="RAM" value={n.ram} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agents overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Agent activity</CardTitle>
            <Link to="/app/agents" className="text-[11px] text-jarvis-cyan hover:underline">
              manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.filter((a) => a.state !== "idle").length === 0 ? (
              <p className="text-xs text-muted-foreground">No agents running. Say “use all agents”.</p>
            ) : (
              agents
                .filter((a) => a.state !== "idle")
                .map((a) => {
                  const node = nodes.find((n) => n.id === a.nodeId);
                  return (
                    <div key={a.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{a.label}</span>
                        <span className="font-mono text-muted-foreground">{Math.round(a.progress)}%</span>
                      </div>
                      <Progress value={a.progress} tone={a.progress >= 90 ? "emerald" : a.progress >= 50 ? "cyan" : "amber"} />
                      <p className="text-[10px] text-muted-foreground">{node?.name ?? "unassigned"}</p>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Event stream */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Event bus</CardTitle>
            <Badge tone="cyan">
              <Activity className="size-3" /> realtime
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {events.slice(0, 8).map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 text-[11px]">
                <Badge tone={severityTone[ev.severity]} className="mt-0.5 shrink-0 font-mono">
                  {ev.type}
                </Badge>
                <span className="text-muted-foreground">{ev.payload}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Task queue</CardTitle>
            <Link to="/app/tasks" className="flex items-center gap-1 text-[11px] text-jarvis-cyan hover:underline">
              all tasks <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.slice(0, 4).map((t) => {
              const node = nodes.find((n) => n.id === t.assignedNodeId);
              return (
                <div key={t.id} className="rounded-lg border border-border/40 bg-white/[0.02] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge tone={t.priority === "HIGH" || t.priority === "CRITICAL" ? "rose" : "default"}>{t.priority}</Badge>
                      <Badge tone="cyan" className="font-mono">{t.state}</Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={t.progress} className="flex-1" />
                    <span className="font-mono text-[11px] text-muted-foreground">{Math.round(t.progress)}%</span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {node?.name ?? "unassigned"} · {t.agentIds.length} agents · updated {formatRelative(t.updatedAt)}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Models */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Model router</CardTitle>
            <Link to="/app/models" className="text-[11px] text-jarvis-cyan hover:underline">
              models
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {models.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{m.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.privacy}</p>
                </div>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: m.loaded ? heatColor(30) : "rgba(148,163,184,0.4)" }}
                />
              </div>
            ))}
            <div className="border-t border-border/40 pt-3">
              <KeyValue k="Local-first routing" v={<Badge tone="emerald">active</Badge>} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  hint: string;
  tone: "cyan" | "violet" | "emerald" | "rose";
}) {
  const tones = {
    cyan: "text-jarvis-cyan bg-jarvis-cyan/10",
    violet: "text-jarvis-violet bg-jarvis-violet/10",
    emerald: "text-jarvis-emerald bg-jarvis-emerald/10",
    rose: "text-jarvis-rose bg-jarvis-rose/10",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground/80">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
