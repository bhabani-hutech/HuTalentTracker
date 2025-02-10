import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface TimelineEvent {
  candidate: string;
  status: string;
  date: string;
  time: string;
  type: "success" | "error" | "warning" | "info";
}

const timelineEvents: TimelineEvent[] = [
  {
    candidate: "John Smith",
    status: "Cleared Technical Round",
    date: "Today",
    time: "2:30 PM",
    type: "success",
  },
  {
    candidate: "Sarah Wilson",
    status: "Scheduled for HR Round",
    date: "Today",
    time: "11:00 AM",
    type: "info",
  },
  {
    candidate: "Michael Brown",
    status: "Rejected in Technical Round",
    date: "Yesterday",
    time: "4:15 PM",
    type: "error",
  },
  {
    candidate: "Emily Davis",
    status: "Pending Feedback",
    date: "Yesterday",
    time: "2:00 PM",
    type: "warning",
  },
];

export function StatusTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {timelineEvents.map((event, i) => (
            <div key={i} className="flex gap-4">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(event.type)}`}
                />
                {i !== timelineEvents.length - 1 && (
                  <div className="absolute top-4 w-px h-[calc(100%+1rem)] bg-border" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.candidate}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.status}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {event.date} at {event.time}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}
