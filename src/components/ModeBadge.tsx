import { Badge } from "@/components/ui/badge";
import type { NodeMode } from "@/types";

const modeTone: Record<NodeMode, "cyan" | "emerald" | "amber" | "rose" | "violet" | "default"> = {
  NORMAL: "default",
  FAST: "cyan",
  REST: "amber",
  SLEEP: "violet",
  FOCUS: "emerald",
  QUIET: "default",
  AWAY: "violet",
  HOME: "emerald",
  ALERT: "rose",
};

export function ModeBadge({ mode }: { mode: NodeMode }) {
  return <Badge tone={modeTone[mode]}>{mode}</Badge>;
}
