import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Users, CheckCircle2, XCircle } from "lucide-react";

export function InterviewInsights() {
  const insights = [
    {
      title: "Today's Interviews",
      value: 8,
      icon: <Calendar className="h-4 w-4 text-blue-500" />,
      description: "3 Technical, 5 HR rounds",
    },
    {
      title: "This Week's Schedule",
      value: 24,
      icon: <Users className="h-4 w-4 text-purple-500" />,
      description: "15 Technical, 9 HR rounds",
    },
    {
      title: "Completed",
      value: 18,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      description: "12 Selected, 6 Rejected",
    },
    {
      title: "Cancelled/Rescheduled",
      value: 3,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      description: "2 Cancelled, 1 Rescheduled",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {insights.map((item, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
