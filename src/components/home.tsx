import { MetricCard } from "./dashboard/metric-card";
import { DashboardFilters } from "./dashboard/filters";
import { DateRangePicker } from "./dashboard/date-range-picker";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { PipelineChart } from "./dashboard/pipeline-chart";
import { QuickActions } from "./dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Briefcase, Clock, Users, UserCheck, Layers } from "lucide-react";
import {
  getDashboardMetrics,
  getRecruitmentPipeline,
  getRecentActivities,
} from "@/lib/api/dashboard";

function Home() {
  const [date, setDate] = useState<DateRange | undefined>();
  const [metrics, setMetrics] = useState({
    openPositions: 0,
    activeCandidates: 0,
    interviewsThisWeek: 0,
    offersAccepted: 0,
  });
  const [pipelineData, setPipelineData] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsData, pipelineData, activitiesData] = await Promise.all([
          getDashboardMetrics(),
          getRecruitmentPipeline(),
          getRecentActivities(),
        ]);

        setMetrics(metricsData);
        setPipelineData(pipelineData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Recruitment Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your recruitment pipeline
          </p>
        </div>
        <DashboardFilters />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open Positions"
          value={metrics.openPositions}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active Candidates"
          value={metrics.activeCandidates}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Interviews This Week"
          value={metrics.interviewsThisWeek}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Offers Accepted"
          value={metrics.offersAccepted}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4">
        <QuickActions />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recruitment Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PipelineChart />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "New application for Senior Developer position",
                "Interview scheduled with John Doe",
                "Offer letter sent to Jane Smith",
                "Background verification completed for Mike Johnson",
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
