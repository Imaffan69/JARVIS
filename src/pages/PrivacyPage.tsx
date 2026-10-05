import { Ban, Filter, Globe, Lock, ShieldCheck, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJarvis } from "@/state/store";
import { cn, formatRelative } from "@/lib/utils";
import type { DataClass, PrivacyEvent } from "@/types";

const outcomeMeta: Record<
  PrivacyEvent["outcome"],
  { tone: "emerald" | "cyan" | "amber" | "rose"; icon: typeof Ban; label: string }
> = {
  LOCAL: { tone: "emerald", icon: Lock, label: "LOCAL" },
  EXTERNAL_ALLOWED: { tone: "cyan", icon: Globe, label: "ALLOWED" },
  SANITIZED: { tone: "amber", icon: Wand2, label: "SANITIZED" },
  BLOCKED: { tone: "rose", icon: Ban, label: "BLOCKED" },
};

const classes: Array<[DataClass, string, "emerald" | "cyan" | "amber" | "rose" | "violet" | "default"]> = [
  ["PUBLIC", "safe anywhere", "emerald"],
  ["NON_PERSONAL", "external default", "cyan"],
  ["USER_SELECTED", "per policy", "violet"],
  ["PRIVATE", "local only", "amber"],
  ["SENSITIVE", "local only", "rose"],
  ["SECRET", "never leaves vault", "rose"],
];

export function PrivacyPage() {
  const { privacy, audit, externalAllowed } = useJarvis();
  const blocked = privacy.filter((p) => p.outcome === "BLOCKED");
  const counts = {
    local: privacy.filter((p) => p.outcome === "LOCAL").length,
    external: privacy.filter((p) => p.outcome === "EXTERNAL_ALLOWED").length,
    sanitized: privacy.filter((p) => p.outcome === "SANITIZED").length,
    blocked: blocked.length,
  };

  return (
    <div>
      <PageHeader
        title="Privacy Gateway"
        subtitle="Every outbound request is classified, sanitized and policy-checked. If a rule would be violated, the request is blocked rather than leaked."
        actions={<Badge tone={externalAllowed ? "cyan" : "rose"}>external providers {externalAllowed ? "policy-gated" : "disabled"}</Badge>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["Local requests", counts.local, "emerald"],
            ["External allowed", counts.external, "cyan"],
            ["Sanitized", counts.sanitized, "amber"],
            ["Blocked", counts.blocked, "rose"],
          ] as const
        ).map(([label, value, tone]) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className={cn("font-display text-3xl font-bold", `text-jarvis-${tone}`)}>{value}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-jarvis-violet" /> Request log
            </CardTitle>
            <Badge tone="default">{privacy.length} recent</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {privacy.map((p) => {
              const meta = outcomeMeta[p.outcome];
              const Icon = meta.icon;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    p.outcome === "BLOCKED" ? "border-jarvis-rose/30 bg-jarvis-rose/5" : "border-border/40 bg-white/[0.02]",
                  )}
                >
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
                    <Icon className={cn("size-4", `text-jarvis-${meta.tone}`)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <span className="font-mono text-[11px] text-muted-foreground">{p.provider}</span>
                      <Badge>{p.dataClass}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{p.reason}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/80">
                      {p.redactions} redactions · {p.bytes}B · {formatRelative(p.at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-4 text-jarvis-cyan" /> Data classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {classes.map(([cls, desc, tone]) => (
                <div key={cls} className="flex items-center justify-between">
                  <Badge tone={tone}>{cls}</Badge>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked by reason</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Private memory in payload — denied.</p>
              <p>Credential reference without vault permission — denied.</p>
              <p>School data to non-approved provider — denied.</p>
              <p className="pt-2 text-[11px]">
                {audit.filter((a) => a.result === "DENIED").length} denied actions are recorded in the audit trail.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
