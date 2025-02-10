import { StatusOverview } from "../components/status-tracking/status-overview";
import { StatusTimeline } from "../components/status-tracking/status-timeline";
import { StatusAnalytics } from "../components/status-tracking/status-analytics";

export default function StatusTracking() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status Tracking</h1>
        <p className="text-muted-foreground">
          Track candidate progress and interview outcomes
        </p>
      </div>
      <StatusOverview />
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <StatusTimeline />
        <StatusAnalytics />
      </div>
    </div>
  );
}
