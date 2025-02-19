import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Users, CheckCircle2, Clock, FileCheck } from "lucide-react";
import { useUsers } from "@/lib/api/hooks/useUsers";

export function AssociateMetrics() {
  const { users } = useUsers();
  const metrics = [
    {
      name: "Active Associates",
      count: users?.filter((user) => user.is_active).length || 0,
      total: users?.length || 0,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      name: "HR Team",
      count: users?.filter((user) => user.role === "HR").length || 0,
      total: users?.length || 0,
      icon: <FileCheck className="h-4 w-4 text-yellow-500" />,
    },
    {
      name: "Hiring Managers",
      count:
        users?.filter((user) => user.role === "Hiring Manager").length || 0,
      total: users?.length || 0,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    },
    {
      name: "Interviewers",
      count: users?.filter((user) => user.role === "Interviewer").length || 0,
      total: users?.length || 0,
      icon: <Clock className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.count}</div>
            <Progress
              value={(metric.count / metric.total) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {((metric.count / metric.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
