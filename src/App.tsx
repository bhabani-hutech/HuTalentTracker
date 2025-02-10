import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ResumeSourcing from "./pages/resume-sourcing";
import InterviewSchedule from "./pages/interview-schedule";
import InterviewFeedback from "./pages/interview-feedback";
import Settings from "./pages/settings";
import routes from "tempo-routes";

const StatusTracking = lazy(() => import("./pages/status-tracking"));
const AssociateOnboarding = lazy(() => import("./pages/associate-onboarding"));

import { SiteHeader } from "./components/layout/site-header";
import { SiteFooter } from "./components/layout/site-footer";
import { DocumentPreviewPage } from "./components/associate-onboarding/document-preview-page";
import { NavItem } from "./types/navigation";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  MessageSquare,
  ListTodo,
  UserPlus,
  Database,
  Settings as SettingsIcon,
  Briefcase,
} from "lucide-react";

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Resume Sourcing",
    href: "/resume-sourcing",
    icon: FileText,
  },
  {
    title: "Interview Schedule",
    href: "/interview-scheduling",
    icon: Calendar,
  },
  {
    title: "Interview Feedback",
    href: "/interview-feedback",
    icon: MessageSquare,
  },
  {
    title: "Status Tracking",
    href: "/status-tracking",
    icon: ListTodo,
  },
  {
    title: "Associate Onboarding",
    href: "/associate-onboarding",
    icon: Briefcase,
  },
  {
    title: "Master Data",
    href: "/master-data",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

function App() {
  return (
    <div className="relative flex min-h-screen">
      <SiteHeader items={navigationItems} />
      <main
        className="flex-1 transition-all duration-300 pb-14"
        style={{ paddingLeft: "var(--sidebar-width, 250px)" }}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume-sourcing" element={<ResumeSourcing />} />
            <Route
              path="/interview-scheduling"
              element={<InterviewSchedule />}
            />
            <Route path="/interview-feedback" element={<InterviewFeedback />} />
            <Route path="/status-tracking" element={<StatusTracking />} />
            <Route
              path="/associate-onboarding"
              element={<AssociateOnboarding />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/master-data" element={<Settings />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <>
                <Route path="/tempobook/*" />
                <Route
                  path="/tempobook/preview/:id"
                  element={<DocumentPreviewPage />}
                />
              </>
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
