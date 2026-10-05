import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { createElement } from "react";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { CommandPage } from "@/pages/CommandPage";
import { ChatPage } from "@/pages/ChatPage";
import { TasksPage } from "@/pages/TasksPage";
import { AgentsPage } from "@/pages/AgentsPage";
import { DevicesPage } from "@/pages/DevicesPage";
import { ModelsPage } from "@/pages/ModelsPage";
import { MemoryPage } from "@/pages/MemoryPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { ActivityPage } from "@/pages/ActivityPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useJarvis } from "@/state/store";

const pages: Array<[string, React.ComponentType]> = [
  ["/", LandingPage],
  ["/auth", AuthPage],
  ["/app", CommandPage],
  ["/app/chat", ChatPage],
  ["/app/tasks", TasksPage],
  ["/app/agents", AgentsPage],
  ["/app/devices", DevicesPage],
  ["/app/models", ModelsPage],
  ["/app/memory", MemoryPage],
  ["/app/projects", ProjectsPage],
  ["/app/notifications", NotificationsPage],
  ["/app/privacy", PrivacyPage],
  ["/app/activity", ActivityPage],
  ["/app/settings", SettingsPage],
];

// Seed an owner so identity-dependent rendering is exercised.
useJarvis.getState().createOwner({ name: "Owner", email: "owner@home.local", assistantName: "JARVIS" });

let failures = 0;
for (const [path, Page] of pages) {
  try {
    const html = renderToString(
      createElement(StaticRouter, { location: path }, createElement(Page)),
    );
    const ok = html.length > 200;
    if (!ok) failures++;
    console.log(`${ok ? "ok   " : "EMPTY"} ${path.padEnd(22)} ${html.length} chars`);
  } catch (err) {
    failures++;
    console.log(`FAIL  ${path.padEnd(22)} ${(err as Error).message}`);
  }
}
console.log(failures === 0 ? "\nSMOKE PASS" : `\nSMOKE FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
