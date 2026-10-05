import { useState } from "react";
import { Fingerprint, RotateCcw, Save, ShieldCheck, SlidersHorizontal, UserCog } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useJarvis } from "@/state/store";
import { cn } from "@/lib/utils";
import type { NodeMode, Permission } from "@/types";

const modes: NodeMode[] = ["NORMAL", "FAST", "REST", "SLEEP", "FOCUS", "QUIET", "AWAY", "HOME", "ALERT"];

const permissionGroups: Array<[string, Permission[]]> = [
  ["Files", ["FILES_READ", "FILES_WRITE"]],
  ["Sensors", ["MICROPHONE", "CAMERA", "NOTIFICATIONS", "CALLS", "CONTACTS"]],
  ["Communication", ["EMAIL_READ", "EMAIL_SEND"]],
  ["Computer", ["BROWSER", "TERMINAL", "SYSTEM_SETTINGS"]],
  ["Development", ["GITHUB_READ", "GITHUB_WRITE"]],
  ["Home & secrets", ["HOME_CONTROL", "CREDENTIAL_ACCESS"]],
];

export function SettingsPage() {
  const { owner, setAssistantName, globalMode, setGlobalMode, parallelAgents, preferLocal, externalAllowed, toggleFlag, reset } =
    useJarvis();
  const [name, setName] = useState(owner?.assistantName ?? "JARVIS");
  const [saved, setSaved] = useState(false);
  const [granted, setGranted] = useState<Record<string, boolean>>({
    FILES_READ: true,
    FILES_WRITE: true,
    MICROPHONE: true,
    NOTIFICATIONS: true,
    BROWSER: true,
    TERMINAL: true,
    GITHUB_READ: true,
    HOME_CONTROL: true,
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Identity, modes, permissions, privacy and resource policy — all owner-controlled."
        actions={<Badge tone="cyan">{owner?.email}</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-4 text-jarvis-cyan" /> Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Assistant name</span>
              <div className="flex gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="JARVIS / FRIDAY / KAREN" />
                <Button
                  onClick={() => {
                    setAssistantName(name.trim() || "JARVIS");
                    setSaved(true);
                    window.setTimeout(() => setSaved(false), 1500);
                  }}
                >
                  <Save className="size-4" /> Save
                </Button>
              </div>
            </label>
            {saved ? <p className="text-xs text-jarvis-emerald">Identity updated.</p> : null}
            <div className="flex flex-wrap gap-2">
              {["JARVIS", "FRIDAY", "KAREN"].map((n) => (
                <button
                  key={n}
                  onClick={() => setName(n)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px]",
                    name === n ? "border-jarvis-cyan/50 bg-jarvis-cyan/15 text-jarvis-cyan" : "border-border/60 text-muted-foreground",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Owner: <span className="text-foreground">{owner?.name}</span> · the name changes the personality layer
              only — architecture is unchanged.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-jarvis-violet" /> Modes & policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Global mode</p>
              <div className="flex flex-wrap gap-1.5">
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => setGlobalMode(m)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-[11px]",
                      globalMode === m ? "border-jarvis-cyan/50 bg-jarvis-cyan/15 text-jarvis-cyan" : "border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <Toggle label="Parallel agent teams" desc="Run independent subtasks concurrently." value={parallelAgents} onChange={() => toggleFlag("parallelAgents")} />
            <Toggle label="Prefer local models" desc="Only use external providers when local cannot suffice." value={preferLocal} onChange={() => toggleFlag("preferLocal")} />
            <Toggle label="Allow external providers" desc="Still gated by the Privacy Gateway." value={externalAllowed} onChange={() => toggleFlag("externalAllowed")} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-jarvis-emerald" /> Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {permissionGroups.map(([group, perms]) => (
                <div key={group}>
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{group}</p>
                  <div className="space-y-2">
                    {perms.map((p) => (
                      <button
                        key={p}
                        onClick={() => setGranted((g) => ({ ...g, [p]: !g[p] }))}
                        className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-jarvis-cyan/40"
                      >
                        <span className="font-mono text-[11px] text-foreground">{p}</span>
                        <span
                          className={cn(
                            "h-4 w-7 rounded-full p-0.5 transition-colors",
                            granted[p] ? "bg-jarvis-emerald/70" : "bg-white/[0.12]",
                          )}
                        >
                          <span
                            className={cn(
                              "block h-3 w-3 rounded-full bg-white transition-transform",
                              granted[p] && "translate-x-3",
                            )}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="size-4 text-jarvis-rose" /> Resource thresholds & danger zone
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 text-xs">
              {[
                ["Temperature → REST", "78 °C"],
                ["Battery → REST", "20 %"],
                ["RAM ceiling", "85 %"],
                ["Max agents per node", "8"],
                ["Model download policy", "OWNER APPROVAL"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-jarvis-rose/30 bg-jarvis-rose/5 p-4">
              <p className="text-sm font-medium text-foreground">Reset local state</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Restores seed nodes, tasks, agents and memories. Does not touch credentials or paired devices.
              </p>
              <Button variant="destructive" size="sm" className="mt-4" onClick={reset}>
                <RotateCcw className="size-3.5" /> Reset control center
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] px-3 py-3 text-left">
      <span>
        <span className="block text-xs font-medium text-foreground">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{desc}</span>
      </span>
      <span className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", value ? "bg-jarvis-cyan/70" : "bg-white/[0.12]")}>
        <span className={cn("block h-4 w-4 rounded-full bg-white transition-transform", value && "translate-x-4")} />
      </span>
    </button>
  );
}
