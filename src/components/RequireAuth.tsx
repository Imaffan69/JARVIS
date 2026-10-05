import { Navigate, useLocation } from "react-router-dom";
import { useJarvis } from "@/state/store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const authenticated = useJarvis((s) => s.authenticated);
  const location = useLocation();
  if (!authenticated) {
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
