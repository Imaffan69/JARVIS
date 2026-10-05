// Core domain model — mirrors JARVIS master plan §4-§40, §57, §61.

export type NodePlatform = "windows" | "android" | "linux" | "macos" | "web" | "embedded";

export type NodeMode = "NORMAL" | "FAST" | "REST" | "SLEEP" | "FOCUS" | "QUIET" | "AWAY" | "HOME" | "ALERT";

export type NodeStatus = "online" | "offline" | "degraded";

export type Capability =
  | "voice"
  | "microphone"
  | "speaker"
  | "camera"
  | "display"
  | "filesystem"
  | "terminal"
  | "browser"
  | "code_editor"
  | "nodejs"
  | "android_apps"
  | "android_accessibility"
  | "windows_apis"
  | "home_control"
  | "storage"
  | "gpu"
  | "model_host"
  | "sensors";

export type Permission =
  | "FILES_READ"
  | "FILES_WRITE"
  | "MICROPHONE"
  | "CAMERA"
  | "NOTIFICATIONS"
  | "CALLS"
  | "CONTACTS"
  | "EMAIL_READ"
  | "EMAIL_SEND"
  | "BROWSER"
  | "TERMINAL"
  | "GITHUB_READ"
  | "GITHUB_WRITE"
  | "HOME_CONTROL"
  | "SYSTEM_SETTINGS"
  | "CREDENTIAL_ACCESS";

export type RiskLevel =
  | "READ"
  | "LOW_RISK_WRITE"
  | "EXTERNAL_COMMUNICATION"
  | "SENSITIVE"
  | "DESTRUCTIVE"
  | "SYSTEM_CONTROL";

export type TaskPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW" | "BACKGROUND" | "IDLE";

export type TaskState =
  | "QUEUED"
  | "PLANNING"
  | "ASSIGNED"
  | "RUNNING"
  | "WAITING"
  | "PAUSED"
  | "MIGRATING"
  | "RETRYING"
  | "BLOCKED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type AgentKind =
  | "MASTER"
  | "PLANNER"
  | "RESEARCH"
  | "CODING"
  | "UI"
  | "BROWSER"
  | "COMPUTER"
  | "ANDROID"
  | "WINDOWS"
  | "FILE"
  | "GIT"
  | "TESTING"
  | "SECURITY"
  | "MEMORY"
  | "COMMUNICATION"
  | "CALENDAR"
  | "HOME"
  | "VISION"
  | "VOICE"
  | "MONITORING"
  | "RECOVERY"
  | "PRIVACY";

export type AgentState = "idle" | "active" | "waiting" | "blocked" | "complete";

export type DataClass = "PUBLIC" | "NON_PERSONAL" | "USER_SELECTED" | "PRIVATE" | "SENSITIVE" | "SECRET";

export type MemoryType =
  | "SHORT_TERM"
  | "LONG_TERM"
  | "EPISODIC"
  | "SEMANTIC"
  | "PREFERENCE"
  | "HABIT"
  | "PROJECT"
  | "RELATIONSHIP"
  | "SYSTEM";

export type ModelPrivacy = "LOCAL" | "HYBRID" | "EXTERNAL";

export interface JarvisNode {
  id: string;
  name: string;
  platform: NodePlatform;
  status: NodeStatus;
  mode: NodeMode;
  owner: string;
  trusted: boolean;
  cpu: number;
  ram: number;
  gpu: number;
  temperature: number;
  battery: number;
  storage: number;
  network: "wifi" | "ethernet" | "cellular" | "offline";
  ramGb: number;
  models: string[];
  capabilities: Capability[];
  lastSeen: number;
  region?: string;
}

export interface JarvisAgent {
  id: string;
  kind: AgentKind;
  label: string;
  state: AgentState;
  progress: number;
  nodeId: string | null;
  modelId: string | null;
  taskId: string | null;
  load: number;
  permissions: Permission[];
  summary: string;
}

export interface JarvisTask {
  id: string;
  title: string;
  description: string;
  state: TaskState;
  priority: TaskPriority;
  progress: number;
  requiredCapabilities: Capability[];
  requiredPermissions: Permission[];
  assignedNodeId: string | null;
  agentIds: string[];
  dependencies: string[];
  createdAt: number;
  updatedAt: number;
  deadline?: number;
  dataClass: DataClass;
  attempts: number;
  audit: { at: number; message: string }[];
}

export interface JarvisModel {
  id: string;
  name: string;
  family: string;
  params: string;
  sizeGb: number;
  ramRequiredGb: number;
  contextK: number;
  speed: "instant" | "fast" | "balanced" | "slow";
  privacy: ModelPrivacy;
  installed: boolean;
  loaded: boolean;
  downloading?: number;
  nodeId: string | null;
  capabilities: string[];
  scoreCoding: number;
  scoreReasoning: number;
  scoreSpeed: number;
}

export interface JarvisMemory {
  id: string;
  type: MemoryType;
  content: string;
  source: string;
  confidence: number;
  importance: number;
  approved: boolean;
  createdAt: number;
  lastUsedAt: number;
  tags: string[];
}

export interface PrivacyEvent {
  id: string;
  at: number;
  outcome: "LOCAL" | "EXTERNAL_ALLOWED" | "BLOCKED" | "SANITIZED";
  provider: string;
  dataClass: DataClass;
  reason: string;
  redactions: number;
  bytes: number;
}

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  device: string;
  agent: string;
  taskId: string | null;
  action: string;
  permission: Permission | null;
  risk: RiskLevel;
  result: "SUCCESS" | "DENIED" | "FAILED";
}

export interface NotificationItem {
  id: string;
  at: number;
  title: string;
  body: string;
  priority: "CRITICAL" | "IMPORTANT" | "NORMAL" | "LOW" | "SILENT";
  source: string;
  action: "READ" | "IGNORE" | "SUMMARIZE" | "ANNOUNCE" | "REMIND" | "STORE";
  read: boolean;
}

export interface ChatMessage {
  id: string;
  at: number;
  role: "user" | "jarvis" | "system";
  text: string;
  topic: string;
  agentIds?: string[];
  taskId?: string | null;
  pending?: boolean;
}

export interface ProjectRecord {
  id: string;
  name: string;
  status: "PLANNING" | "ACTIVE" | "REVIEW" | "DEPLOYED" | "PAUSED";
  progress: number;
  agentIds: string[];
  createdAt: number;
  description: string;
}

export interface EventLogItem {
  id: string;
  at: number;
  type: string;
  payload: string;
  severity: "info" | "warn" | "error" | "success";
}
