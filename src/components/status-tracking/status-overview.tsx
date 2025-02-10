import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

const stages = [
  {
    name: "Screening",
    count: 45,
    total: 120,
    icon: <Users className="h-4 w-4 text-blue-500" />,
  },
  {
    name: "Technical Round",
    count: 28,
    total: 45,
    icon: <Clock className="h-4 w-4 text-yellow-500" />,
  },
  {
    name: "HR Round",
    count: 15,
    total: 28,
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  {
    name: "Rejected",
    count: 77,
    total: 120,
    icon: <XCircle className="h-4 w-4 text-red-500" />,
  },
];

export function StatusOverview() {
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
