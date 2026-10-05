import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Lock, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useJarvis } from "@/state/store";
import { cn } from "@/lib/utils";

type Tab = "signin" | "create";

export function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { createOwner, authenticated, owner, events } = useJarvis();

  const returnTo = params.get("returnTo") || "/app";
  const hasOwner = events.some((e) => e.type === "OWNER_ACCOUNT_CREATED");
  const [tab, setTab] = useState<Tab>(hasOwner ? "signin" : "create");
  const [name, setName] = useState(owner?.name ?? "");
  const [email, setEmail] = useState(owner?.email ?? "");
  const [assistantName, setAssistantName] = useState(owner?.assistantName ?? "JARVIS");
  const [error, setError] = useState("");

  if (authenticated) {
    return <Navigate to={returnTo} replace />;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter your name so the assistant can address you.");
    if (!email.includes("@")) return setError("Enter a valid email for the owner account.");
    createOwner({ name: name.trim(), email: email.trim(), assistantName: assistantName.trim() || "JARVIS" });
    navigate(returnTo, { replace: true });
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border/40 bg-slate-950/50 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 grid-plane opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-jarvis-cyan/15 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-jarvis-cyan/25 to-jarvis-emerald/20 hairline">
            <span className="font-display text-sm font-bold text-jarvis-cyan">J</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-[0.3em] text-foreground">JARVIS</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Personal AI OS</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Badge tone="cyan" className="mb-5">Private access</Badge>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground">
            Your devices. Your models. Your rules.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            This is not a public SaaS. Creating the owner account initializes the local JARVIS identity and the
            permission, memory and device-trust structure that everything else is gated on.
          </p>
          <div className="mt-8 space-y-4">
            {[
              [ShieldCheck, "Granular permissions", "Nothing runs without a granted scope."],
              [Lock, "Encrypted vault", "Credentials never enter AI memory."],
              [Bot, "One identity", "Call it JARVIS, FRIDAY, KAREN or anything."],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="flex gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04] hairline">
                    <I className="size-4 text-jarvis-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{title as string}</p>
                    <p className="text-xs text-muted-foreground">{body as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative font-mono text-[11px] text-muted-foreground">
          never bypasses OS · app · authentication safeguards
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass w-full max-w-md rounded-2xl p-7"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              {tab === "create" ? "Create owner account" : "Sign in"}
            </h2>
            <Badge tone={tab === "create" ? "emerald" : "cyan"}>
              {tab === "create" ? "first run" : "returning"}
            </Badge>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-white/[0.02] p-1">
            {(["create", "signin"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  tab === t ? "bg-jarvis-cyan/20 text-jarvis-cyan" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "create" ? "Create owner" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === "create" ? (
              <>
                <Field label="Your name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" autoComplete="name" />
                </Field>
                <Field label="Owner email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@home.local" autoComplete="email" />
                </Field>
                <Field label="Assistant identity">
                  <Input
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="JARVIS / FRIDAY / KAREN"
                  />
                </Field>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  The name only changes the personality layer — the architecture stays identical. You can rename it
                  any time.
                </p>
              </>
            ) : (
              <>
                <Field label="Owner email">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@home.local" autoComplete="email" />
                </Field>
                <Field label="Owner name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" autoComplete="name" />
                </Field>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  This console runs against the local JARVIS runtime. Sign-in restores your identity, modes and
                  paired nodes.
                </p>
              </>
            )}

            {error ? <p className="text-xs text-jarvis-rose">{error}</p> : null}

            <Button type="submit" variant="glow" size="lg" className="w-full">
              {tab === "create" ? (
                <>
                  <UserPlus className="size-4" /> Initialize JARVIS
                </>
              ) : (
                <>
                  Enter control center <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Returning to <span className="font-mono text-jarvis-cyan">{returnTo}</span> ·{" "}
            <Link to="/" className="underline decoration-dotted hover:text-foreground">
              back to landing
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
