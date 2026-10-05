import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  BrainCircuit,
  Cpu,
  Fingerprint,
  Github,
  Home,
  KeyRound,
  Lock,
  Mic,
  Network,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJarvis } from "@/state/store";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: EASE },
  }),
};

function Orb() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.35),transparent_62%)] blur-2xl" />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-jarvis-cyan/25"
          style={{ inset: `${i * 9}%` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 26 + i * 12, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-jarvis-cyan shadow-[0_0_12px_2px_rgba(34,211,238,0.9)]" />
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-[22%] grid place-items-center rounded-full bg-gradient-to-br from-jarvis-cyan/25 via-slate-950 to-jarvis-emerald/20 hairline"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-center">
          <p className="font-display text-3xl font-extrabold tracking-[0.25em] text-jarvis-cyan text-glow">J</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">online</p>
        </div>
      </motion.div>
    </div>
  );
}

const capabilities = [
  { icon: Waypoints, title: "Distributed by design", body: "Every installation is a JARVIS node. Phones, laptops and tablets pool into one elastic resource graph — no fixed master." },
  { icon: BrainCircuit, title: "Multi-agent teams", body: "Say “use all agents” and a coordinated team spins up: planner, research, coding, UI, security and testing specialists." },
  { icon: Network, title: "Capability-aware routing", body: "Tasks are matched to the node that can actually perform them. No fake completions — limitations are explained, alternatives offered." },
  { icon: Activity, title: "24/7 daemon", body: "Heartbeats, checkpoints and migration keep long tasks alive when a device sleeps, overheats or loses power." },
  { icon: Bell, title: "Notifications & school", body: "Authorized monitoring turns assignments, email and notifications into tasks, reminders and a daily briefing." },
  { icon: Home, title: "Home & sensors", body: "Home Assistant, cameras and presence sensors feed events back into the same intelligence layer." },
];

const models = [
  { name: "Local reasoning", tag: "on-device", detail: "Private planning and chat" },
  { name: "Coding model", tag: "on-device", detail: "Repo-aware code generation" },
  { name: "Whisper STT", tag: "voice", detail: "Wake word → transcription" },
  { name: "Approved external", tag: "policy-gated", detail: "Only non-personal data" },
];

export function LandingPage() {
  const authenticated = useJarvis((s) => s.authenticated);

  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-slate-950/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-jarvis-cyan/25 to-jarvis-emerald/20 hairline">
              <span className="font-display text-sm font-bold text-jarvis-cyan">J</span>
            </div>
            <div>
              <p className="font-display text-sm font-bold tracking-[0.3em] text-foreground">JARVIS</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Personal AI OS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#capabilities" className="transition-colors hover:text-foreground">Capabilities</a>
            <a href="#devices" className="transition-colors hover:text-foreground">Devices</a>
            <a href="#privacy" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to={authenticated ? "/app" : "/auth?returnTo=%2Fapp"}>
              <Button variant="glow" size="sm">
                {authenticated ? "Open console" : "Enter JARVIS"} <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
          <Badge tone="cyan" className="mb-5">
            <Lock className="size-3" /> Private · local-first · owner-controlled
          </Badge>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            One intelligent assistant,
            <br />
            <span className="bg-gradient-to-r from-jarvis-cyan via-cyan-200 to-jarvis-emerald bg-clip-text text-transparent">
              backed by a distributed computer.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            JARVIS is your private personal AI operating system. Voice, text and events flow into a single
            orchestrator that plans, routes work across your devices, runs specialized agents and keeps every
            secret on hardware you own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={authenticated ? "/app" : "/auth?returnTo=%2Fapp"}>
              <Button size="lg" variant="glow">
                <Sparkles className="size-4" /> Create owner account
              </Button>
            </Link>
            <a href="#capabilities">
              <Button size="lg" variant="outline">Explore the architecture</Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
            {[
              ["Local-first", "models run on your nodes"],
              ["Never bypasses", "OS & app security"],
              ["Owner approval", "for every model download"],
            ].map(([a, b]) => (
              <div key={a} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-jarvis-emerald" />
                <span className="text-foreground">{a}</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Orb />
        </motion.div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="container py-16">
        <SectionHeading eyebrow="Capabilities" title="Not a chatbot — an operating system" sub="Everything below is one intelligence, even though hundreds of processes may run underneath." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="glass group rounded-xl p-5 transition-all hover:border-jarvis-cyan/40 hover:shadow-[0_0_40px_-16px_rgba(34,211,238,0.6)]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-jarvis-cyan/10 hairline">
                <c.icon className="size-5 text-jarvis-cyan" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Devices / resource pool */}
      <section id="devices" className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading align="left" eyebrow="Resource pool" title="Your devices become one machine" sub="Nodes advertise capabilities on connect. The orchestrator decides what each one should do — and migrates work when one disappears." />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["ZBook", "FAST", "coding · browser · GPU"],
                ["Phone", "NORMAL", "voice · camera · apps"],
                ["Tablet", "REST", "relay · sensors"],
              ].map(([name, mode, caps]) => (
                <div key={name} className="glass rounded-lg p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-jarvis-emerald" /> {name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-jarvis-cyan">{mode}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{caps}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">node heartbeat</p>
              <Badge tone="emerald">live</Badge>
            </div>
            <pre className="scrollbar-thin overflow-x-auto rounded-lg bg-black/40 p-4 text-[11px] leading-relaxed text-cyan-200/90">
{`{
  "nodeId": "node_a83f92",
  "platform": "windows",
  "state": "FAST",
  "cpu": 42, "ram": 61, "temp": 48,
  "models": ["reason-7b", "qwen-coder-7b"],
  "capabilities": [
    "filesystem", "terminal", "browser",
    "code_editor", "windows_apis"
  ]
}`}
            </pre>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                ["3", "nodes online"],
                ["12", "capabilities"],
                ["6", "models"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-lg bg-white/[0.03] py-3">
                  <p className="font-display text-xl font-bold text-jarvis-cyan">{v}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI / model router */}
      <section className="container py-16">
        <SectionHeading eyebrow="AI" title="The best available model, chosen per task" sub="Simple jobs use tiny local models. Coding uses the strongest coder. Complex reasoning escalates. Nothing heavy is downloaded without your approval." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {models.map((m, i) => (
            <motion.div
              key={m.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="glass rounded-xl p-5"
            >
              <Cpu className="size-5 text-jarvis-emerald" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">{m.name}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-jarvis-cyan">{m.tag}</p>
              <p className="mt-2 text-xs text-muted-foreground">{m.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy + Security split */}
      <section id="privacy" className="container grid gap-6 py-16 lg:grid-cols-2">
        <div className="glass rounded-2xl p-7">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-jarvis-violet/10 hairline">
            <ShieldCheck className="size-5 text-jarvis-violet" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Privacy Gateway</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every external request is classified, sanitized and policy-checked before it leaves your system.
            Passwords, private memories, personal messages and school data are blocked by default — not by hope.
          </p>
          <div className="mt-5 space-y-2 font-mono text-[11px]">
            <FlowRow label="PRIVATE memory detected" tone="rose" value="BLOCKED" />
            <FlowRow label="Credential references stripped" tone="amber" value="SANITIZED" />
            <FlowRow label="Non-personal refactor" tone="emerald" value="ALLOWED" />
          </div>
        </div>
        <div id="security" className="glass rounded-2xl p-7">
          <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-jarvis-cyan/10 hairline">
            <Fingerprint className="size-5 text-jarvis-cyan" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Security by authorization</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            JARVIS is powerful because it holds granted permissions — never because it bypasses them. Granular
            scopes, encrypted credential vault, device trust and a full audit trail keep control in your hands.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              [KeyRound, "Credential vault"],
              [Lock, "Device trust"],
              [Github, "Governed repo access"],
              [Mic, "Local Whisper STT"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof KeyRound;
              return (
                <div key={label as string} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
                  <I className="size-3.5 text-jarvis-cyan" /> {label as string}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Automation + CTA */}
      <section className="container py-16">
        <div className="glass relative overflow-hidden rounded-2xl p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 grid-plane opacity-40" />
          <div className="relative">
            <Badge tone="emerald" className="mb-5">Private access · invite only</Badge>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Take command of your machine.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              Create the owner account, pair your devices and start talking. No public signups, no user
              discovery — just you and the people you explicitly trust.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={authenticated ? "/app" : "/auth?returnTo=%2Fapp"}>
                <Button size="lg" variant="glow">
                  {authenticated ? "Open control center" : "Create owner account"} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">I already have access</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="container flex flex-col items-center justify-between gap-3 border-t border-border/40 py-8 text-xs text-muted-foreground sm:flex-row">
        <p>JARVIS · private distributed personal AI operating system</p>
        <p className="font-mono">never bypasses OS, app or authentication safeguards</p>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("mb-10", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl")}>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-jarvis-cyan">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {sub ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function FlowRow({ label, tone, value }: { label: string; tone: "rose" | "amber" | "emerald"; value: string }) {
  const colors = { rose: "text-jarvis-rose", amber: "text-jarvis-amber", emerald: "text-jarvis-emerald" };
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", colors[tone])}>{value}</span>
    </div>
  );
}
