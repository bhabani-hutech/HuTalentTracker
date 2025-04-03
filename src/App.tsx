import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth/AuthContext";
import Home from "./components/home";
import ResumeSourcing from "./pages/resume-sourcing";
import InterviewFeedback from "./pages/interview-feedback";
import InterviewKanban from "./pages/interview-kanban";
import InterviewFlow from "./pages/interview-flow";
import Settings from "./pages/settings";
import routes from "tempo-routes";
import { Icons } from "@/components/icons";
import InterviewSchedule from "./pages/interview-schedule";
import Jobs from "./pages/jobs";
import NewJob from "./pages/jobs/new";
import JobSelection from "./pages/jobs/select";

import { useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth/AuthContext";

const StatusTracking = lazy(() => import("./pages/status-tracking"));
const AssociateOnboarding = lazy(() => import("./pages/associate-onboarding"));
const HiringPartners = lazy(() => import("./pages/hiring-partners"));

import { SiteHeader } from "./components/layout/site-header";
import { SiteFooter } from "./components/layout/site-footer";
import { DocumentPreviewPage } from "./components/associate-onboarding/document-preview-page";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
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
  GitBranch,
  Users,
} from "lucide-react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import MasterData from "./pages/masterdata";

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
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
    title: "Interview Feedback",
    href: "/interview-feedback",
    icon: MessageSquare,
  },

  {
    title: "Interview Flow",
    href: "/interview-flow",
    icon: GitBranch,
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
    title: "Hiring Partners",
    href: "/hiring-partners",
    icon: Users,
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

// Configure with optimized defaults to prevent excessive API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 0,
      staleTime: 300000, // 5 minutes
    },
  },
});

function AppContent() {
  const { user } = useAuth(); // Get authentication state
  const location = useLocation(); // Get current route

  // Check if the current page is login or signup
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="relative flex min-h-screen">
      {/* Show SiteHeader only if user is authenticated and not on login/signup pages */}
      {!isAuthPage && user && <SiteHeader items={navigationItems} />}

      <main
        className="flex-1 transition-all duration-300 pb-14"
        style={{
          paddingLeft:
            !isAuthPage && user ? "var(--sidebar-width, 250px)" : "0",
        }}
      >
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            {user ? (
              <>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/new" element={<NewJob />} />
                <Route path="/jobs/:id" element={<NewJob />} />
                <Route path="/jobs/select" element={<JobSelection />} />
                <Route path="/resume-sourcing" element={<ResumeSourcing />} />
                <Route
                  path="/interview-scheduling"
                  element={<InterviewSchedule />}
                />
                <Route path="/interview-kanban" element={<InterviewKanban />} />
                <Route path="/interview-flow" element={<InterviewFlow />} />
                <Route
                  path="/interview-feedback"
                  element={<InterviewFeedback />}
                />
                <Route path="/status-tracking" element={<StatusTracking />} />
                <Route
                  path="/associate-onboarding"
                  element={<AssociateOnboarding />}
                />
                <Route path="/hiring-partners" element={<HiringPartners />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/master-data" element={<MasterData />} />
              </>
            ) : (
              // Redirect unauthorized users to login
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </Suspense>
      </main>

      {/* Show SiteFooter only if user is authenticated and not on login/signup pages */}
      {!isAuthPage && user && <SiteFooter />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
