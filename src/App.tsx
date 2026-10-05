import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<CommandPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="memory" element={<MemoryPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
