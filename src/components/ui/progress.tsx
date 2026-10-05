import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  tone = "cyan",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "violet";
}) {
  const tones: Record<string, string> = {
    cyan: "from-jarvis-cyan to-cyan-300",
    emerald: "from-jarvis-emerald to-emerald-300",
    amber: "from-jarvis-amber to-amber-300",
    rose: "from-jarvis-rose to-rose-300",
    violet: "from-jarvis-violet to-violet-300",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tones[tone], barClassName)}
        style={{ width: `${clamp(value)}%` }}
      />
    </div>
  );
}
