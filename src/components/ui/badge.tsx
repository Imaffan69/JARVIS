import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      tone: {
        default: "border-border/70 bg-white/[0.04] text-muted-foreground",
        cyan: "border-jarvis-cyan/40 bg-jarvis-cyan/10 text-jarvis-cyan",
        emerald: "border-jarvis-emerald/40 bg-jarvis-emerald/10 text-jarvis-emerald",
        amber: "border-jarvis-amber/40 bg-jarvis-amber/10 text-jarvis-amber",
        rose: "border-jarvis-rose/40 bg-jarvis-rose/10 text-jarvis-rose",
        violet: "border-jarvis-violet/40 bg-jarvis-violet/10 text-jarvis-violet",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
