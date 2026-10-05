import { FolderKanban, GitBranch, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useJarvis } from "@/state/store";
import { formatRelative } from "@/lib/utils";

const statusTone: Record<string, "cyan" | "emerald" | "amber" | "violet" | "default"> = {
  PLANNING: "violet",
  ACTIVE: "cyan",
  REVIEW: "amber",
  DEPLOYED: "emerald",
  PAUSED: "default",
};

export function ProjectsPage() {
  const { projects, agents } = useJarvis();

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Agents share a single workspace per project — source, tasks, artifacts, test-results, decisions and agent-reports — with locks, branches and patches to prevent corruption."
        actions={<Badge tone="cyan">{projects.length} projects</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((p) => {
          const team = agents.filter((a) => p.agentIds.includes(a.id));
          return (
            <Card key={p.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-jarvis-cyan/10">
                      <FolderKanban className="size-5 text-jarvis-cyan" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.id}</p>
                    </div>
                  </div>
                  <Badge tone={statusTone[p.status] ?? "default"}>{p.status}</Badge>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">{p.description}</p>

                <div className="mt-4 flex items-center gap-3">
                  <Progress value={p.progress} className="flex-1" />
                  <span className="font-mono text-[11px] text-muted-foreground">{p.progress}%</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="size-3.5" /> team
                  </span>
                  {team.map((a) => (
                    <Badge key={a.id} tone="violet">
                      {a.kind}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitBranch className="size-3" /> versioned workspace
                  </span>
                  <span>created {formatRelative(p.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
