import { Boxes, Cpu, Download, HardDrive, Lock, Power } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useJarvis } from "@/state/store";
import { cn } from "@/lib/utils";

const speedTone = { instant: "emerald", fast: "cyan", balanced: "violet", slow: "amber" } as const;
const privacyTone = { LOCAL: "emerald", HYBRID: "amber", EXTERNAL: "rose" } as const;

export function ModelsPage() {
  const { models, nodes, toggleModel, installModel, preferLocal, toggleFlag } = useJarvis();

  return (
    <div>
      <PageHeader
        title="Models"
        subtitle="Models are interchangeable providers. Nothing is ever downloaded without your explicit approval, and local models are preferred whenever they can do the job."
        actions={
          <>
            <Badge tone={preferLocal ? "emerald" : "amber"}>local-first {preferLocal ? "on" : "off"}</Badge>
            <Button variant="outline" size="sm" onClick={() => toggleFlag("preferLocal")}>
              <Lock className="size-3.5" /> {preferLocal ? "Allow external first" : "Prefer local"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map((m) => {
          const node = nodes.find((n) => n.id === m.nodeId);
          const pending = !m.installed;
          return (
            <Card key={m.id} className={cn(pending && "border-jarvis-amber/30")}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04]">
                      <Cpu className="size-5 text-jarvis-cyan" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{m.name}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {m.family} · {m.params}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={privacyTone[m.privacy]}>{m.privacy}</Badge>
                    <Badge tone={speedTone[m.speed]}>{m.speed}</Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Coding", m.scoreCoding],
                    ["Reasoning", m.scoreReasoning],
                    ["Speed", m.scoreSpeed],
                  ].map(([label, score]) => (
                    <div key={label as string} className="rounded-lg bg-white/[0.03] py-2">
                      <p className="font-mono text-sm text-foreground">{score as number}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label as string}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <Row icon={HardDrive} label="Storage" value={`${m.sizeGb} GB`} />
                  <Row icon={Cpu} label="RAM required" value={`${m.ramRequiredGb} GB`} />
                  <Row icon={Boxes} label="Context" value={`${m.contextK}K`} />
                  <Row icon={Power} label="Host node" value={node?.name ?? "—"} />
                </div>

                {!pending ? (
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={m.loaded ? 100 : 4} className="flex-1" tone={m.loaded ? "emerald" : "cyan"} />
                    <span className="font-mono text-[10px] text-muted-foreground">{m.loaded ? "loaded" : "idle"}</span>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
                  {pending ? (
                    <>
                      <Button size="sm" variant="glow" onClick={() => installModel(m.id)}>
                        <Download className="size-3.5" /> Approve install
                      </Button>
                      <span className="self-center text-[10px] text-muted-foreground">
                        requires owner approval
                      </span>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => toggleModel(m.id)}>
                      <Power className="size-3.5" /> {m.loaded ? "Unload" : "Load"}
                    </Button>
                  )}
                  <div className="ml-auto flex flex-wrap gap-1">
                    {m.capabilities.map((c) => (
                      <Badge key={c}>{c}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
