import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Activity,
  Bell,
  Braces,
  Boxes,
  Cpu,
  FolderKanban,
  Gauge,
  Handshake,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Power,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJarvis } from "@/state/store";
import { Button } from "@/components/ui/button";
import { ModeBadge } from "@/components/ModeBadge";
import type { NodeMode } from "@/types";

const nav = [
  { to: "/app", label: "Command", icon: LayoutDashboard, end: true },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
  { to: "/app/tasks", label: "Tasks", icon: Gauge },
  { to: "/app/agents", label: "Agents", icon: Sparkles },
  { to: "/app/devices", label: "Devices", icon: Cpu },
  { to: "/app/models", label: "Models", icon: Boxes },
  { to: "/app/memory", label: "Memory", icon: Braces },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/privacy", label: "Privacy", icon: ShieldCheck },
  { to: "/app/activity", label: "Activity", icon: Activity },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const modes: NodeMode[] = ["NORMAL", "FAST", "REST", "SLEEP", "FOCUS"];

export function AppShell() {
  const { owner, globalMode, setGlobalMode, tick, signOut, notifications } = useJarvis();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = window.setInterval(() => tick(), 1600);
    return () => window.clearInterval(timer);
  }, [tick]);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/50 bg-slate-950/60 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-jarvis-cyan/25 to-jarvis-emerald/20 hairline">
            <span className="font-display text-sm font-bold text-jarvis-cyan">J</span>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-jarvis-emerald animate-pulse-glow" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-widest text-foreground">{owner?.assistantName ?? "JARVIS"}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Control center</p>
          </div>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-gradient-to-r from-jarvis-cyan/15 to-transparent text-foreground hairline"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/app/notifications" && unread > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-jarvis-rose/20 px-1.5 text-[10px] font-semibold text-jarvis-rose">
                  {unread}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Handshake className="size-3.5" />
            <span className="truncate">{owner?.email}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              signOut();
              navigate("/auth");
            }}
          >
            <Power className="size-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border/50 bg-slate-950/70 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-display text-sm font-bold tracking-widest text-jarvis-cyan">
              {owner?.assistantName ?? "JARVIS"}
            </span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jarvis-emerald opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-jarvis-emerald" />
            </span>
            Distributed runtime online · 24/7 daemon
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-white/[0.02] p-1">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setGlobalMode(m)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    globalMode === m ? "bg-jarvis-cyan/20 text-jarvis-cyan" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <ModeBadge mode={globalMode} />
            <Button variant="outline" size="sm" onClick={() => navigate("/app/chat")}>
              <Mic className="size-3.5" /> Voice
            </Button>
          </div>
        </header>

        <main className="grid-plane flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
