import { Battery, MonitorSmartphone, QrCode, Wifi } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MetricRow, RadialGauge, KeyValue } from "@/components/ui/stat";
import { ModeBadge } from "@/components/ModeBadge";
import { useJarvis } from "@/state/store";
import { capabilityLabels } from "@/data/seed";
import { formatRelative } from "@/lib/utils";
import type { NodeMode } from "@/types";

const modes: NodeMode[] = ["NORMAL", "FAST", "REST", "SLEEP", "FOCUS"];

export function DevicesPage() {
  const { nodes, models, setNodeMode, setGlobalMode, globalMode } = useJarvis();

  return (
    <div>
      <PageHeader
        title="Devices"
        subtitle="No permanent roles. Every installation is a node that advertises capabilities and gets work assigned dynamically."
        actions={
          <>
            <Badge tone="emerald">{nodes.filter((n) => n.status === "online").length} online</Badge>
            <Button variant="outline" size="sm" onClick={() => setGlobalMode(globalMode === "FAST" ? "NORMAL" : "FAST")}>
              Toggle whole-system {globalMode === "FAST" ? "normal" : "FAST"} mode
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {nodes.map((n) => {
          const nodeModels = models.filter((m) => n.models.includes(m.id) || m.nodeId === n.id);
          const offline = n.status === "offline";
          return (
            <Card key={n.id} className={offline ? "opacity-60" : undefined}>
              <CardHeader className="flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] hairline">
                    <MonitorSmartphone className="size-5 text-jarvis-cyan" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{n.name}</CardTitle>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {n.id} · {n.platform}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Badge tone={offline ? "default" : n.status === "degraded" ? "amber" : "emerald"}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${offline ? "bg-muted-foreground" : "bg-jarvis-emerald"}`}
                      />
                      {n.status}
                    </Badge>
                    <ModeBadge mode={n.mode} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">seen {formatRelative(n.lastSeen)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <RadialGauge value={n.cpu} label="CPU" size={78} />
                    <RadialGauge value={n.ram} label="RAM" size={78} />
                    <RadialGauge value={n.temperature} label="Temp" size={78} sub="°C" />
                  </div>
                  <div className="min-w-[190px] flex-1 space-y-3">
                    {n.gpu > 0 ? <MetricRow label="GPU" value={n.gpu} /> : null}
                    <MetricRow label="Storage" value={n.storage} />
                    <MetricRow label="Battery" value={n.battery} tone="#34d399" />
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Wifi className="size-3.5" /> {n.network}
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="size-3.5" /> {n.battery}%
                      </span>
                      <span className="font-mono">{n.ramGb} GB</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Capabilities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {n.capabilities.map((c) => (
                      <Badge key={c} tone="cyan">
                        {capabilityLabels[c] ?? c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {nodeModels.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Models hosted</p>
                    <div className="space-y-2">
                      {nodeModels.map((m) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <span className="w-40 truncate text-xs text-foreground">{m.name}</span>
                          <Progress value={m.loaded ? 100 : m.downloading ?? 0} className="flex-1" tone={m.loaded ? "emerald" : "amber"} />
                          <span className="font-mono text-[10px] text-muted-foreground">{m.loaded ? "loaded" : "idle"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Set mode</span>
                  {modes.map((m) => (
                    <button
                      key={m}
                      onClick={() => setNodeMode(n.id, m)}
                      className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                        n.mode === m ? "bg-jarvis-cyan/20 text-jarvis-cyan" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                  <div className="ml-auto">
                    <KeyValue k="Owner" v={n.owner} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pairing */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Pair a new node</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="grid h-36 w-36 place-items-center rounded-xl border border-dashed border-border/60 bg-white/[0.02]">
            <QrCode className="size-14 text-muted-foreground/60" />
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Unknown devices cannot simply join the network. A new node scans this pairing code, authenticates with
              its device key, and <span className="text-foreground">waits for your approval</span> before it can
              register capabilities or receive tasks.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["1 · Scan / code", "Device proves identity"],
                ["2 · Owner approval", "Trust is explicit"],
                ["3 · Register", "Capabilities advertised"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg bg-white/[0.03] px-3 py-3">
                  <p className="text-xs font-medium text-foreground">{t}</p>
                  <p className="text-[11px] text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <QrCode className="size-3.5" /> Generate pairing invite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
