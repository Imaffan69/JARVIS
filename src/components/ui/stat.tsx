import { cn, heatColor } from "@/lib/utils";

export function RadialGauge({
  value,
  label,
  sub,
  size = 96,
}: {
  value: number;
  label: string;
  sub?: string;
  size?: number;
}) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const color = heatColor(pct);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="7" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            style={{ transition: "stroke-dashoffset 0.7s ease, stroke 0.7s ease", filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold" style={{ color }}>
            {Math.round(pct)}
          </span>
          {sub ? <span className="text-[10px] text-muted-foreground">{sub}</span> : null}
        </div>
      </div>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

export function MetricRow({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const color = tone ?? heatColor(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono" style={{ color }}>
          {Math.round(value)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
        />
      </div>
    </div>
  );
}

export function KeyValue({ k, v, className }: { k: string; v: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 text-xs", className)}>
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono text-foreground">{v}</span>
    </div>
  );
}
