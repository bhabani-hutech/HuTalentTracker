import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ResumeSourcing from "./pages/resume-sourcing";
import InterviewFeedback from "./pages/interview-feedback";
import InterviewKanban from "./pages/interview-kanban";
import Settings from "./pages/settings";
import routes from "tempo-routes";
import { Icons } from "@/components/icons";
import InterviewScheduleDashboard from "./pages/interview-schedule-dashboard";
import Jobs from "./pages/jobs";
import NewJob from "./pages/jobs/new";
import JobSelection from "./pages/jobs/select";

const StatusTracking = lazy(() => import("./pages/status-tracking"));
const AssociateOnboarding = lazy(() => import("./pages/associate-onboarding"));

import { SiteHeader } from "./components/layout/site-header";
import { SiteFooter } from "./components/layout/site-footer";
import { DocumentPreviewPage } from "./components/associate-onboarding/document-preview-page";
import { NavItem } from "./types/navigation";
import { useRoutes } from "react-router-dom";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  MessageSquare,
  ListTodo,
  Database,
  Settings as SettingsIcon,
  Briefcase,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import MasterData from "./pages/masterdata";

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: FileText,
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
    title: "Interview Pipeline",
    href: "/interview-kanban",
    icon: ListTodo,
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

const queryClient = new QueryClient();

function AppContent() {
  return (
    <div className="relative flex min-h-screen">
      <SiteHeader items={navigationItems} />
      <main
        className="flex-1 transition-all duration-300 pb-14"
        style={{ paddingLeft: "var(--sidebar-width, 250px)" }}
      >
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<NewJob />} />
            <Route path="/jobs/:id" element={<NewJob />} />
            <Route path="/jobs/select" element={<JobSelection />} />
            <Route path="/resume-sourcing" element={<ResumeSourcing />} />
            <Route
              path="/interview-scheduling"
              element={<InterviewScheduleDashboard />}
            />
            {/* Interview Feedback routes */}
            <Route path="/interview-kanban" element={<InterviewKanban />} />
            <Route path="/interview-feedback" element={<InterviewFeedback />}>
              <Route path=":interviewId" element={<InterviewFeedback />} />
              <Route
                path=":interviewId/feedback/:feedbackId"
                element={<InterviewFeedback />}
              />
            </Route>
            <Route path="/status-tracking" element={<StatusTracking />} />
            <Route
              path="/associate-onboarding"
              element={<AssociateOnboarding />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/master-data" element={<MasterData />} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
