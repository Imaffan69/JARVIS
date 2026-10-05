import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedAgents,
  seedAudit,
  seedChat,
  seedEvents,
  seedMemories,
  seedModels,
  seedNodes,
  seedNotifications,
  seedPrivacy,
  seedProjects,
  seedTasks,
  seedTopics,
} from "@/data/seed";
import type {
  AuditEntry,
  ChatMessage,
  EventLogItem,
  JarvisAgent,
  JarvisMemory,
  JarvisModel,
  JarvisNode,
  JarvisTask,
  NodeMode,
  NotificationItem,
  PrivacyEvent,
  ProjectRecord,
  TaskState,
} from "@/types";
import { uid } from "@/lib/utils";

export interface OwnerProfile {
  name: string;
  email: string;
  assistantName: string;
  createdAt: number;
}

interface JarvisState {
  // identity / auth
  owner: OwnerProfile | null;
  authenticated: boolean;
  globalMode: NodeMode;
  parallelAgents: boolean;
  preferLocal: boolean;
  externalAllowed: boolean;
  emergencyStop: boolean;

  // domain
  nodes: JarvisNode[];
  agents: JarvisAgent[];
  tasks: JarvisTask[];
  models: JarvisModel[];
  memories: JarvisMemory[];
  privacy: PrivacyEvent[];
  audit: AuditEntry[];
  notifications: NotificationItem[];
  chat: ChatMessage[];
  projects: ProjectRecord[];
  events: EventLogItem[];
  topics: string[];
  activeTopic: string;

  // actions
  createOwner: (input: { name: string; email: string; assistantName: string }) => void;
  signOut: () => void;
  setAssistantName: (name: string) => void;
  setGlobalMode: (mode: NodeMode) => void;
  setNodeMode: (nodeId: string, mode: NodeMode) => void;
  toggleFlag: (flag: "parallelAgents" | "preferLocal" | "externalAllowed", value?: boolean) => void;
  setActiveTopic: (topic: string) => void;
  addTopic: (topic: string) => void;

  sendChat: (text: string, viaVoice?: boolean) => void;
  runCommand: (text: string) => void;

  createTask: (title: string, priority?: JarvisTask["priority"]) => string;
  setTaskState: (taskId: string, state: TaskState) => void;
  migrateTask: (taskId: string, nodeId: string) => void;
  approveMemory: (id: string, approved: boolean) => void;
  toggleModel: (id: string) => void;
  installModel: (id: string) => void;
  markNotificationRead: (id: string) => void;

  tick: () => void;
  reset: () => void;
}

const baseData = {
  nodes: seedNodes,
  agents: seedAgents,
  tasks: seedTasks,
  models: seedModels,
  memories: seedMemories,
  privacy: seedPrivacy,
  audit: seedAudit,
  notifications: seedNotifications,
  chat: seedChat,
  projects: seedProjects,
  events: seedEvents,
  topics: seedTopics,
};

function logEvent(list: EventLogItem[], type: string, payload: string, severity: EventLogItem["severity"]) {
  return [{ id: uid("ev"), at: Date.now(), type, payload, severity }, ...list].slice(0, 60);
}

export const useJarvis = create<JarvisState>()(
  persist(
    (set, get) => ({
      owner: null,
      authenticated: false,
      globalMode: "NORMAL",
      parallelAgents: true,
      preferLocal: true,
      externalAllowed: true,
      emergencyStop: false,

      ...baseData,
      activeTopic: seedTopics[0],

      createOwner: ({ name, email, assistantName }) =>
        set({
          owner: { name, email, assistantName: assistantName || "JARVIS", createdAt: Date.now() },
          authenticated: true,
          events: logEvent(get().events, "OWNER_ACCOUNT_CREATED", email, "success"),
        }),

      signOut: () => set({ authenticated: false }),

      setAssistantName: (name) =>
        set((s) => ({
          owner: s.owner ? { ...s.owner, assistantName: name } : s.owner,
        })),

      setGlobalMode: (mode) =>
        set((s) => ({
          globalMode: mode,
          nodes: mode === "REST" || mode === "SLEEP" ? s.nodes.map((n) => ({ ...n, mode })) : s.nodes,
          events: logEvent(s.events, "GLOBAL_MODE", mode, "info"),
        })),

      setNodeMode: (nodeId, mode) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, mode } : n)),
          events: logEvent(s.events, "NODE_MODE", `${nodeId} → ${mode}`, "info"),
        })),

      toggleFlag: (flag, value) =>
        set((s) => {
          const next = value ?? !s[flag];
          if (flag === "parallelAgents") return { parallelAgents: next };
          if (flag === "preferLocal") return { preferLocal: next };
          return { externalAllowed: next };
        }),

      setActiveTopic: (topic) => set({ activeTopic: topic }),
      addTopic: (topic) =>
        set((s) => (s.topics.includes(topic) ? s : { topics: [...s.topics, topic] })),

      sendChat: (text, viaVoice) => {
        const { activeTopic } = get();
        const userMsg: ChatMessage = {
          id: uid("cm"),
          at: Date.now(),
          role: "user",
          topic: activeTopic,
          text,
        };
        const pending: ChatMessage = {
          id: uid("cm"),
          at: Date.now() + 1,
          role: "jarvis",
          topic: activeTopic,
          text: "",
          pending: true,
        };
        set((s) => ({ chat: [...s.chat, userMsg, pending], events: logEvent(s.events, viaVoice ? "VOICE_INPUT" : "TEXT_INPUT", text.slice(0, 80), "info") }));
        window.setTimeout(() => {
          const reply = craftReply(text, get());
          set((s) => ({
            chat: s.chat.map((m) =>
              m.id === pending.id
                ? {
                    ...m,
                    text: reply.text,
                    pending: false,
                    agentIds: reply.activate.map((k) => `agent_${k.toLowerCase()}`),
                    taskId: reply.taskId,
                  }
                : m,
            ),
            agents: reply.activate.length
              ? s.agents.map((a) => (reply.activate.includes(a.kind) ? { ...a, state: "active", progress: Math.max(a.progress, 12) } : a))
              : s.agents,
          }));
        }, 750);
      },

      runCommand: (text) => {
        const t = text.toLowerCase();
        if (t.includes("rest")) get().setGlobalMode("REST");
        else if (t.includes("fast")) get().setGlobalMode("FAST");
        else if (t.includes("sleep")) get().setGlobalMode("SLEEP");
        else if (t.includes("pause")) set((s) => ({ tasks: s.tasks.map((x) => (x.state === "RUNNING" ? { ...x, state: "PAUSED" } : x)) }));
        else if (t.includes("resume")) set((s) => ({ tasks: s.tasks.map((x) => (x.state === "PAUSED" ? { ...x, state: "RUNNING" } : x)) }));
        get().sendChat(text);
      },

      createTask: (title, priority = "NORMAL") => {
        const id = uid("task");
        const task: JarvisTask = {
          id,
          title,
          description: "Created from the command center.",
          state: "PLANNING",
          priority,
          progress: 0,
          requiredCapabilities: ["filesystem", "terminal", "browser"],
          requiredPermissions: ["FILES_WRITE"],
          assignedNodeId: get().nodes.find((n) => n.status === "online" && n.capabilities.includes("terminal"))?.id ?? null,
          agentIds: ["agent_master", "agent_planner"],
          dependencies: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          dataClass: "NON_PERSONAL",
          attempts: 1,
          audit: [{ at: Date.now(), message: "Task created" }],
        };
        set((s) => ({ tasks: [task, ...s.tasks], events: logEvent(s.events, "TASK_CREATED", title, "success") }));
        return id;
      },

      setTaskState: (taskId, state) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, state, updatedAt: Date.now(), progress: state === "COMPLETED" ? 100 : t.progress } : t,
          ),
          events: logEvent(s.events, `TASK_${state}`, taskId, state === "FAILED" ? "error" : "info"),
        })),

      migrateTask: (taskId, nodeId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, assignedNodeId: nodeId, state: "MIGRATING", updatedAt: Date.now(), audit: [...t.audit, { at: Date.now(), message: `Migration requested to ${nodeId}` }] }
              : t,
          ),
          events: logEvent(s.events, "TASK_MIGRATE", `${taskId} → ${nodeId}`, "warn"),
        })),

      approveMemory: (id, approved) =>
        set((s) => ({
          memories: s.memories.map((m) => (m.id === id ? { ...m, approved } : m)),
          events: logEvent(s.events, approved ? "MEMORY_APPROVED" : "MEMORY_REVOKED", id, "info"),
        })),

      toggleModel: (id) =>
        set((s) => ({
          models: s.models.map((m) => (m.id === id ? { ...m, loaded: !m.loaded } : m)),
        })),

      installModel: (id) =>
        set((s) => ({
          models: s.models.map((m) => (m.id === id ? { ...m, installed: true, downloading: 0 } : m)),
          audit: [
            { id: uid("au"), at: Date.now(), actor: "Owner", device: "ZBook Workstation", agent: "Model Manager", taskId: null, action: `Approved model install: ${id}`, permission: null, risk: "SYSTEM_CONTROL", result: "SUCCESS" },
            ...s.audit,
          ],
          events: logEvent(s.events, "MODEL_INSTALLED", id, "success"),
        })),

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      tick: () => {
        const s = get();
        if (!s.authenticated) return;
        set((state) => {
          const nodes = state.nodes.map((n) => {
            if (n.status === "offline") return n;
            const jitter = (base: number, amp = 4) => Math.max(2, Math.min(98, base + (Math.random() - 0.5) * amp));
            let temperature = jitter(n.temperature, 3);
            let mode: NodeMode = n.mode;
            let status = n.status;
            if (temperature > 78 && n.mode !== "REST" && n.mode !== "SLEEP") {
              mode = "REST";
              status = "degraded";
              temperature = 62;
            } else if (status === "degraded" && temperature < 62) {
              status = "online";
            }
            const battery = n.battery >= 100 ? 100 : Math.max(3, n.battery - (Math.random() < 0.3 ? 1 : 0));
            return {
              ...n,
              cpu: jitter(n.cpu, 8),
              ram: jitter(n.ram, 5),
              gpu: n.gpu ? jitter(n.gpu, 10) : 0,
              temperature,
              battery,
              mode,
              status,
              lastSeen: Date.now(),
            };
          });

          const agents = state.agents.map((a): JarvisAgent => {
            if (a.state !== "active") return a;
            const delta = (Math.random() - 0.35) * 4;
            const progress = Math.max(0, Math.min(100, a.progress + delta));
            return {
              ...a,
              progress,
              load: Math.max(5, Math.min(98, a.load + (Math.random() - 0.5) * 6)),
              state: progress >= 100 ? "complete" : a.state,
            };
          });

          const tasks = state.tasks.map((t) => {
            if (t.state !== "RUNNING" && t.state !== "ASSIGNED" && t.state !== "MIGRATING") return t;
            const progress = Math.min(100, t.progress + Math.random() * 0.8);
            return {
              ...t,
              progress,
              state: progress >= 100 ? "COMPLETED" : t.state === "MIGRATING" ? "RUNNING" : t.state,
              updatedAt: Date.now(),
            } as JarvisTask;
          });

          return { nodes, agents, tasks };
        });
      },

      reset: () =>
        set({
          ...baseData,
          authenticated: true,
          globalMode: "NORMAL",
          parallelAgents: true,
          preferLocal: true,
          externalAllowed: true,
          emergencyStop: false,
        }),
    }),
    {
      name: "jarvis-control-center",
      partialize: (s) => ({
        owner: s.owner,
        authenticated: s.authenticated,
        globalMode: s.globalMode,
        parallelAgents: s.parallelAgents,
        preferLocal: s.preferLocal,
        externalAllowed: s.externalAllowed,
        nodes: s.nodes,
        models: s.models,
        memories: s.memories,
        notifications: s.notifications,
        activeTopic: s.activeTopic,
        topics: s.topics,
      }),
    },
  ),
);

interface Reply {
  text: string;
  activate: JarvisAgent["kind"][];
  taskId?: string | null;
}

function craftReply(text: string, s: JarvisState): Reply {
  const t = text.toLowerCase();
  const localModel = s.models.find((m) => m.privacy === "LOCAL" && m.installed);
  const onlineNodes = s.nodes.filter((n) => n.status !== "offline");

  if (t.includes("all agents") || t.includes("multiple agents") || t.includes("use everything")) {
    return {
      text: `Spinning up an agent team across ${onlineNodes.length} online nodes. Routing planning to ${localModel?.name ?? "a local model"} and code to the strongest coding model available. Independent subtasks run in parallel; dependencies are gated. Checkpoints are being written so any node can be migrated without losing work.`,
      activate: ["MASTER", "PLANNER", "CODING", "UI", "RESEARCH", "TESTING", "SECURITY"],
      taskId: "task_1",
    };
  }
  if (t.includes("vscode") || t.includes("vs code") || t.includes("folder")) {
    return {
      text: "This device doesn't have VS Code. I can create the project folder in this node's filesystem (FILES_WRITE), or run the VS Code operation on your connected ZBook Workstation, which reports code_editor + filesystem + terminal and is healthy. Which would you prefer?",
      activate: ["PLANNER"],
    };
  }
  if (t.includes("local only") || t.includes("only use local")) {
    return {
      text: "Understood — external providers are now excluded from routing. Everything stays on your nodes, using local models only. If a task exceeds local capability I'll report the limitation instead of leaking data.",
      activate: [],
    };
  }
  if (t.includes("briefing") || t.includes("morning")) {
    return {
      text: `Good morning, ${s.owner?.name ?? "sir"}. You have 3 school assignments, 2 reminders, 1 important email and 2 project tasks. Highest priority: the ZeroKore marketing site (task_1, 64% complete).`,
      activate: ["MEMORY"],
      taskId: "task_3",
    };
  }
  if (t.includes("device") || t.includes("show")) {
    return {
      text: `Currently ${onlineNodes.length} nodes online, ${s.nodes.length - onlineNodes.length} offline. ZBook is in FAST at ${Math.round(s.nodes[0]?.cpu ?? 0)}% CPU — best node for code and browser work. Phone is voice-ready. Tablet moved to REST on low battery.`,
      activate: ["MONITORING"],
    };
  }
  return {
    text: `On it. Local-first routing selected ${localModel?.name ?? "a local model"}; privacy classification passed (no external data leaving the system for this request). I'll report back with results and any permission prompts.`,
    activate: ["MASTER", "PLANNER"],
  };
}

export function useAssistantName() {
  const owner = useJarvis((s) => s.owner);
  return owner?.assistantName ?? "JARVIS";
}
