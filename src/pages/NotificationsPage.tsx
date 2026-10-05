import { Bell, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJarvis } from "@/state/store";
import { cn, formatRelative } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const priorityTone: Record<NotificationItem["priority"], "rose" | "amber" | "cyan" | "default" | "violet"> = {
  CRITICAL: "rose",
  IMPORTANT: "amber",
  NORMAL: "cyan",
  LOW: "default",
  SILENT: "violet",
};

const actionTone: Record<NotificationItem["action"], string> = {
  READ: "text-jarvis-emerald",
  SUMMARIZE: "text-jarvis-cyan",
  ANNOUNCE: "text-jarvis-amber",
  REMIND: "text-jarvis-violet",
  STORE: "text-muted-foreground",
  IGNORE: "text-jarvis-rose",
};

export function NotificationsPage() {
  const { notifications, markNotificationRead } = useJarvis();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Policy decides what happens to each notification: READ, IGNORE, SUMMARIZE, ANNOUNCE, REMIND or STORE. Personal apps can be excluded entirely."
        actions={<Badge tone="amber">{unread} unread</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={cn(!n.read && "border-jarvis-cyan/25")}>
              <CardContent className="flex items-start gap-4 pt-5">
                <div className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04]", !n.read && "bg-jarvis-cyan/10")}>
                  <Bell className={cn("size-4", !n.read ? "text-jarvis-cyan" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                    <Badge tone={priorityTone[n.priority]}>{n.priority}</Badge>
                    <span className={cn("font-mono text-[10px] uppercase tracking-widest", actionTone[n.action])}>
                      {n.action}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/80">
                    {n.source} · {formatRelative(n.at)}
                  </p>
                </div>
                {!n.read ? (
                  <Button size="sm" variant="outline" onClick={() => markNotificationRead(n.id)}>
                    <Check className="size-3.5" /> Dismiss
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-3 pt-5 text-xs">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active policies</p>
            {[
              ["School apps", "READ", "emerald"],
              ["WhatsApp", "IGNORE", "rose"],
              ["Email", "SUMMARIZE", "cyan"],
              ["Home alerts", "ANNOUNCE", "amber"],
            ].map(([src, act, tone]) => (
              <div key={src} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                <span className="text-muted-foreground">{src}</span>
                <Badge tone={tone as "emerald"}>{act}</Badge>
              </div>
            ))}
            <p className="pt-2 leading-relaxed text-muted-foreground">
              The Attention Manager decides when it is appropriate to interrupt you, based on priority and the
              active system mode.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
