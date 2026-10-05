import { Activity, FileClock, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJarvis } from "@/state/store";
import { cn, formatRelative, formatTime } from "@/lib/utils";
import type { AuditEntry } from "@/types";

const riskTone: Record<AuditEntry["risk"], "default" | "cyan" | "amber" | "rose" | "violet"> = {
  READ: "default",
  LOW_RISK_WRITE: "cyan",
  EXTERNAL_COMMUNICATION: "violet",
  SENSITIVE: "amber",
  DESTRUCTIVE: "rose",
  SYSTEM_CONTROL: "rose",
};

export function ActivityPage() {
  const { audit, events } = useJarvis();

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle="Every important action records time, actor, device, agent, task, tool, permission and result — never secret contents."
        actions={<Badge tone="cyan">{audit.length} audited actions</Badge>}
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileClock className="size-4 text-jarvis-cyan" /> Audit log
            </CardTitle>
            <Badge tone="default">no secrets logged</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {audit.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/40 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatTime(a.at)} · {a.actor} · {a.device}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={riskTone[a.risk]}>{a.risk}</Badge>
                    <Badge tone={a.result === "SUCCESS" ? "emerald" : a.result === "DENIED" ? "rose" : "amber"}>
                      {a.result}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground">{a.action}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {a.agent} · {a.taskId ?? "no task"} · permission {a.permission ?? "none"} · {formatRelative(a.at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-jarvis-emerald" /> Event bus
              </CardTitle>
              <Badge tone="emerald">streaming</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.slice(0, 14).map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-[11px]">
                  <span className="font-mono text-muted-foreground/70">{formatTime(ev.at)}</span>
                  <Badge
                    tone={
                      ev.severity === "error"
                        ? "rose"
                        : ev.severity === "warn"
                          ? "amber"
                          : ev.severity === "success"
                            ? "emerald"
                            : "cyan"
                    }
                    className="shrink-0 font-mono"
                  >
                    {ev.type}
                  </Badge>
                  <span className="truncate text-muted-foreground">{ev.payload}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-jarvis-amber" /> Security monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                ["Node temperature", "1 degraded (auto-REST triggered)", "amber"],
                ["Failed logins", "0", "emerald"],
                ["Suspicious connections", "0", "emerald"],
                ["Storage pressure", "1 node above 80%", "amber"],
                ["Denied actions", `${audit.filter((a) => a.result === "DENIED").length}`, "rose"],
              ].map(([label, value, tone]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-mono", `text-jarvis-${tone}`)}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
