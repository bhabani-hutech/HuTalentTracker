import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

import { useInterviews } from "@/lib/api/hooks/useInterviews";

export function StatusOverview() {
  const { interviews } = useInterviews();

  // Calculate counts for each stage
  const stats = {
    screening:
      interviews?.filter(
        (i) => i.type === "technical" && i.status === "Rejected in screening",
      )?.length || 0,
    technical:
      interviews?.filter(
        (i) => i.type === "technical" && i.status !== "Rejected in screening",
      )?.length || 0,
    hr: interviews?.filter((i) => i.type === "hr")?.length || 0,
    rejected:
      interviews?.filter((i) => i.status?.includes("Rejected"))?.length || 0,
    total: interviews?.length || 0,
  };

  const stages = [
    {
      name: "Screening",
      count: stats.screening,
      total: stats.total,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      name: "Technical Round",
      count: stats.technical,
      total: stats.total,
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
    },
    {
      name: "HR Round",
      count: stats.hr,
      total: stats.total,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    },
    {
      name: "Rejected",
      count: stats.rejected,
      total: stats.total,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <Card key={stage.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
            {stage.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stage.count}</div>
            <Progress
              value={(stage.count / stage.total) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {((stage.count / stage.total) * 100).toFixed(1)}% of total
              candidates
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
